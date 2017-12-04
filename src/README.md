Data and Code for: "A neural algorithm for a fundamental computing problem"


Two directories:

    "data/" contains the feature vectors for each dataset (10k examples).
    "src/" contains the fly algorithm and LSH.


The main script is "src/hash.py". This program takes five parameters:
    -p [random projection type: DG, SB#]
    -y [number of Kenyon cells: #]
    -w [tag selection method: all, top, random]
    -l [hash length: #]
    -d [dataset: sift10k, glove10k, mnist10k, gist10k]

Examples for Figure 3:

  Fly:
    Sparse, binary random projection where each Kenyon cell
    samples 12 inputs, with 1280 Kenyon cells, selecting the
    top 16 firing neurons for the hash length, evaluated on
    sift10k: ./hash.py -p SB12 -y 1280 -w top -l 16 -d sift10k

  LSH:
    Set -p (random projection type) to "DG"
    Set -y (number of Kenyon cells) to be equal to -l (hash length)
    Set -w (tag selection method) to be "all"

    Dense, Gaussian random projection with a hash length of 16, evaluated on
    sift10k: ./hash.py -p DG -y 16 -w all -l 16 -d sift10k

Contact: 
    Saket Navlakha (navlakha@salk.edu)