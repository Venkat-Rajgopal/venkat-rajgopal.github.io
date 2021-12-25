---
title: "Many facets of Python's Virtual Environments"
excerpt: "Looking at the multiple ways of setting up a venv in Python"
date: 2021-12-15
categories:
  - python
tags:
  - [python]
comments: true
---
This XKCD artwork is quite well know now. 

<img src="/assets/images/2021-12-15-Many-faces-of-python-venvs_files/python_environment.png" alt="eval" width="650"/> 

However if you set up things right, its not a mess at all rather a charm to work with. We will see how easy is it with setting up environments. 

We look at the following methods. 
- [Python `venv`](#venv)
- [Conda](#conda)
- [Poetry](#poetry)

--- 
# Python Virtual Environments with `venv`
Installing a specific python version using `venv`

```shell
sudo apt install python3.8-venv    
```

Create a virtual environment with `venv`. 

```shell
python3 -m venv <envname>
```

Activate and deactivate the environment. 
```shell
source <venv>/bin/acivate

# to deactivate
deactivate
```
---
# Conda
Download the version of conda you need as below and install. 

```shell
wget https://repo.anaconda.com/miniconda/Miniconda3-py38_4.10.3-Linux-x86_64.sh

# install the above downloaded file
bash Miniconda3-<version>.sh

# remove the file once finished
rm Miniconda3-<version>.sh
```

Update conda
```shell
conda update conda
```

Creating new environments
```shell
conda create --name <env name>

# activate environment
conda activate <env name>
```

Adding packages to conda
```shell
conda install numpy
```

```
# Install env with different python version. 
conda create --name condaenv python=3.8.10
```

Adding packages form environments `yaml`. 

A `yaml` file needs to be created first as described [here](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html#create-env-file-manually)

```
conda env create -f environments.yml
```

Now update environments based on `yaml` .
```
conda env update --file environments.yml
```



For all commands refer [conda cheat sheet](https://docs.conda.io/projects/conda/en/latest/user-guide/cheatsheet.html)

---

# Poetry
This one is my personal favourite just becasue of its simplicity and how effective it is. 

<img src="/assets/images/2021-12-15-Many-faces-of-python-venvs_files/poetry_isin.png" alt="eval" width="450"/> 


Install poetry with `curl`. 

```shell
curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -
```

If python is not found, replace it with `python3`. This could happen if you are using `oh-my-zsh` shell.
```shell
curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python3 -
```

Initialise an environment. This automatically creates a `.toml` file in the directory with all packages. 
```
poetry init
```

Once initialised, install or update if already installed. 
```
poetry install

# in case of an update
poetry update
```

Adding packages to your project? Just do 
```
poetry add <package name>
```

### Build
Want to build the package as wheel? 
```
poetry build
```
and you are good to go. 


### Pro Tip
1. *Do not install from `pip`. Always use the `curl` method as above. 
2. Poetry installs envs in your `.cache/` directory. This below command will install in your working directory if thats the way you work. 

```
poetry config virtualenvs.in-project true
```