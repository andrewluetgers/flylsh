#!/usr/bin/env python

from __future__ import division
from optparse import OptionParser
import random,time
import numpy as np
import heapq

random.seed(10301949)
np.random.seed(10301949)

""" 
    "A neural algorithm for a fundamental computing problem" (2017)
    Sanjoy Dasgupta, Charles F. Stevens, Saket Navlakha.
"""


# Command line parameters.
NUM_KENYON  = -1     # number of Kenyon cells.
PROJECTION  = -1     # type of random projection.
HASH_LENGTH = -1     # hash length.
 
# Dataset-dependent parameters.
NUM_NNS     = -1      # number of nearest neighbors to validate over.
DIM         = -1      # number of dimensions per example.
N           = -1      # number of examples in the dataset.

# Fixed parameters.
SET_MEAN    = 100     # averaging firing rate per odor.
DIST_FN     = "norm2" # distance function.


#==============================================================================
#                             READING INPUT DATA
#==============================================================================
def read_generic_data(filename,do_norm=False):
    """ Generic reader for: sift, gist, corel, mnist, glove, audio, msong. """

    D = np.zeros((N,DIM))
    with open(filename) as f:
        for line_num,line in enumerate(f):
            
            cols = line.strip().split(",")
            assert len(cols) == DIM

            D[line_num,:] = map(float,cols)
            #D[line_num,:] *= -1 # to invert distribution?
            
    assert line_num+1 == N

    return standardize_data(D,do_norm)


def standardize_data(D,do_norm):
    """ Performs several standardizations on the data.
            1) Makes sure all values are non-negative.
            2) Sets the mean of example to SET_MEAN.
            3) Applies normalization if desired.
    """
    
    # 1. Add the most negative number per column (ORN) to make all values >= 0.
    for col in xrange(DIM):
        D[:,col] += abs(min(D[:,col]))

    # 2. Set the mean of each row (odor) to be SET_MEAN.
    for row in xrange(N):
        
        # Multiply by: SET_MEAN / current mean. Keeps proportions the same.
        D[row,:] = D[row,:] * ((SET_MEAN / np.mean(D[row,:])))
        D[row,:] = map(int,D[row,:])        
        
        assert abs(np.mean(D[row,:]) - SET_MEAN) <= 1

    # 3. Applies normalization.
    if do_norm: # := v / np.linalg.norm(v)
        D = D.astype(np.float64)        
        D = normalize(D)

    # Make sure all values (firing rates) are >= 0.
    for row in xrange(N):
        for col in xrange(DIM):
            assert D[row,col] >= 0

    return D


#==============================================================================
#                             ALGORITHM STUFF
#==============================================================================
def create_rand_proj_matrix():
    """ Creates a random projection matrix of size NUM_KENYON by NUM_ORNS. """

    # Create a sparse, binary random projection matrix.
    if PROJECTION.startswith("SB"):

        num_sample = int(PROJECTION[2:]) # "SB6" -> 6
        assert num_sample <= DIM

        # Each row (KC) samples from the glomeruli: every row has num_sample
        # random 1s, and 0s everywhere else.
        M = np.zeros((NUM_KENYON,DIM))
        for row in xrange(NUM_KENYON):

            # Sample NUM_SAMPLE random indices, set these to 1.
            for idx in random.sample(xrange(DIM),num_sample):
                M[row,idx] = 1

            # Make sure I didn't screw anything up!
            assert sum(M[row,:]) == num_sample       

    # Create a dense, Gaussian random projection matrix.
    elif PROJECTION == "DG":
        M = np.random.randn(NUM_KENYON,DIM)

    else: assert False

    return M


def dist(X,Y):
    """ Computes the distance between two vectors. """ 
    
    if DIST_FN == "norm1":
        return np.linalg.norm((X-Y),ord=1)
    elif DIST_FN == "norm2": 
        return np.linalg.norm((X-Y),ord=2) # same as scipy euclidean but faster!
    else:
        assert False


#==============================================================================
#                          EVALUATION FUNCTIONS
#==============================================================================
def tesht_map_dist(D,H):
    """ Computes mean average precision (MAP) and distortion between true nearest-neighbors  
        in input space and approximate nearest-neighbors in hash space. 
    """    

    queries = random.sample(xrange(N),100)

    MAP       = [] # [list of MAP values for each query]        
    for i in queries: 
    
        temp_i = [] # list of (dist input space,odor) from i.
        temp_h = [] # list of (dist hash space ,odor) from i.
        for j in xrange(N):
            if i == j: continue

            # Distance between i and j in input space.
            dij_orig = dist(D[i,:],D[j,:])
            if dij_orig <= 0: continue # i and j are duplicates, e.g. corel: i=1022,j=2435.
            temp_i.append( (dij_orig,j) )
                            
            # Distance between i and j in hash space.
            dij_hash = dist(H[i,:],H[j,:])
            temp_h.append( (dij_hash,j) )
                            
        assert len(temp_i) == len(temp_h) # == N-1 # not the last part bc of duplicates.

        # Create a set of the true NUM_NNS nearest neighbors.
        # true_nns = sorted(temp_i)[0:NUM_NNS]      # true NUM_NNS tuples.
        true_nns = heapq.nsmallest(NUM_NNS,temp_i) # true NUM_NNS tuples. (faster than above)
        true_nns = set([vals[1] for vals in true_nns]) # true NUM_NNS examples.

        # Go through predicted nearest neighbors and compute the MAP.
        # pred_nns = sorted(temp_h)[0:NUM_NNS]      # pred NUM_NNS tuples.
        pred_nns = heapq.nsmallest(NUM_NNS,temp_h) # pred NUM_NNS tuples. (faster than above)
        pred_nns = [vals[1] for vals in pred_nns] # pred NUM_NNS examples.

        assert len(true_nns) == len(pred_nns)

        # Compute MAP: https://makarandtapaswi.wordpress.com/2012/07/02/intuition-behind-average-precision-and-map/
        # E.g.  if the top NUM_NNS results are:   1, 0, 0,   1,   1,   1
        #       then the MAP is:            avg(1/1, 0, 0, 2/4, 3/5, 4/6)
        num_correct_thus_far = 0
        map_temp = []
        for idx,nghbr in enumerate(pred_nns):

            if nghbr in true_nns:
                num_correct_thus_far += 1
                map_temp.append((num_correct_thus_far)/(idx+1))

        map_temp = np.mean(map_temp) if len(map_temp) > 0 else 0
        assert 0.0 <= map_temp <= 1.0

        MAP.append(map_temp)

    # Store overall performance for these queries.
    x_map = np.mean(MAP)
        
    return x_map


#==============================================================================
#                                    MAIN
#==============================================================================
def main():
    start = time.time()

    global NUM_KENYON,PROJECTION,HASH_LENGTH,N,DIM,NUM_NNS

    usage="usage: %prog [options]"
    parser = OptionParser(usage=usage)
    parser.add_option("-p", "--projection", action="store", type="string", dest="projection", default="DG",help="type of random projection: DG (dense Gaussian), SB6 (sparse, binary with sampling=6)")
    parser.add_option("-y", "--kenyon", action="store", type="int", dest="num_kenyon", default=1000,help="number of kenyon cells (i.e. expansion size)")    
    parser.add_option("-w", "--wta", action="store", type="string", dest="wta", default=None,help="type of WTA to perform (top, bottom, rand)")
    parser.add_option("-l", "--hash", action="store", type="int", dest="hash_length", default=8,help="length of the hash")
    parser.add_option("-d", "--dataset", action="store", type="string", dest="dataset", default="halem",help="name of the dataset")

    (options, args) = parser.parse_args()

    NUM_REPEATS = 50
    NUM_KENYON  = options.num_kenyon
    PROJECTION  = options.projection
    HASH_LENGTH = options.hash_length
    DATASET     = options.dataset
    WTA         = options.wta

    
    # ===============================================================

    # Read Sift data: 10,000 images x 128 sift descriptors/features.
    if DATASET == "sift10k":    
        N   = 10000
        DIM = 128
        D   = read_generic_data("../data/sift/sift10k.txt")

    # Read Gist data: 10,000 images x 960 gist descriptors/features.
    elif DATASET == "gist10k":    
        N   = 10000
        DIM = 960
        D   = read_generic_data("../data/gist/gist10k.txt")
    
    # Read MNIST data: 10,000 images x 784 pixels.
    elif DATASET == "mnist10k":
        N   = 10000
        DIM = 784
        D   = read_generic_data("../data/mnist/mnist10k.txt")

    # Read Glove data: 10,000 words x 300 features.
    elif DATASET == "glove10k":
        N   = 10000
        DIM = 300
        D   = read_generic_data("../data/glove/glove10k.txt")

    else: assert False
    

    NUM_NNS = max(10,int(0.02*N)) # 10 or the top 2%.        
    assert NUM_NNS <= N-1

    x_map = [None] * NUM_REPEATS
    for ii in xrange(NUM_REPEATS):

        # Create random projection matrix.
        M = create_rand_proj_matrix() 

        
        # Compute KC activity for each example: multiply input vector by random projection matrix.
        K = np.dot(D,np.transpose(M)) # N x NUM_KENYON
        assert K.shape[0] == N
        assert K.shape[1] == NUM_KENYON


        # ? why bucket width of 10?
        # Perform quantization: add offset, divide by width, take floor.
        offset,width = 0,10
        K = np.floor((K+offset)/width)


        # Apply WTA to KCs: firing rates at indices corresponding to top/bot/rand/all KCs; 0s elsewhere.
        if WTA == "random":# fix indices for all odors, otherwise, can't compare.
            rand_indices = random.sample(xrange(NUM_KENYON),HASH_LENGTH)

        H = np.zeros((N,NUM_KENYON))
        for i in xrange(N):

            # Take all neurons.
            if   WTA == "all":
                assert HASH_LENGTH == NUM_KENYON
                indices = xrange(NUM_KENYON)

            # Highest firing neurons.
            elif WTA == "top":      
                indices = np.argpartition(K[i,:],-HASH_LENGTH)[-HASH_LENGTH:] 

            # Lowest firing neurons.
            elif WTA == "bottom": 
                indices = np.argpartition(K[i,:],HASH_LENGTH)[:HASH_LENGTH]

            # Random neurons. 
            elif WTA == "random": 
                indices = rand_indices#random.sample(xxrange(NUM_KENYON),HASH_LENGTH)

            else: assert False

            H[i,:][indices] = K[i,:][indices]

        # Evaluate MAP.
        x_map[ii] = tesht_map_dist(D,H)

    print "%i\t%s\t%i\t%s\t%i\t%.3f\t%.3f\t%s\t%.2f (mins)" %(DIM,PROJECTION,NUM_KENYON,WTA,HASH_LENGTH,np.mean(x_map),np.std(x_map),DATASET,(time.time()-start) / 60)
    

if __name__ == "__main__":
    main()