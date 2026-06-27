---
author: Venkatramani Rajgopal
pubDatetime: 2024-04-12T21:41:00Z
title: Managing internal Python packages
  with Poetry
slug: managing-packages-with-poetry
featured: true
draft: false
tags:
  - python 🐍
description:
  Efficiently hosting py projects across an organisation
---

Before we dive into managing Py-projects with Poetry, here's a quick list of options to first manage the environment. These include using Python's built-in `venv` module or Conda for creating and managing virtual environments. Once your environment is set up, you can seamlessly transition to using Poetry for package management and project dependencies. 

If this is already know just [jump to Poetry below](#poetry). 

---
## Table of contents

The following methods are well know now. 

Managaing Python envirnments are hard. This XKCD artwork is quite well know now. ![Python Environments](@/assets/blog_resources/python_environment.png)




## Python Virtual Environments with `venv`

| Action                              | Command                              |
|-------------------------------------|--------------------------------------|
| Install a specific Python version   | `sudo apt install python3.8-venv`   |
| Create a virtual environment        | `python3 -m venv <envname>`         |
| Activate the virtual environment    | `source <venv>/bin/activate`        |
| Deactivate the virtual environment  | `deactivate`                        |

## Conda

Download the version of conda you need as below and install.

```shell
wget https://repo.anaconda.com/miniconda/Miniconda3-py38_4.10.3-Linux-x86_64.sh

# install the above downloaded file
bash Miniconda3-<version>.sh

# remove the file once finished
rm Miniconda3-<version>.sh
```

| Command                                      | Description                               |
|----------------------------------------------|-------------------------------------------|
| `conda update conda`                         | update conda                              |
| `conda create --name <env name>`             | creating new environments                 |
| `conda activate <env name>`                  | activate environment                      |
| `conda install <package name>`               | adding packages to conda                  |
| `conda create --name condaenv python=3.8.10` | Install env with different python version |
| `conda env create -f environments.yml`       | adding packages form environments `yaml`  |
| `conda env update --file environments.yml`   | update environments based on `yaml`       |
| `conda env remove --name <env name>`         | remove environment                        |
| `conda list`                                 | list all packages in the environment      |
| `conda list --export > requirements.txt`     | export all packages to a txt              |
| `conda env export > environment.yml`         | export all packages to a yml file         |
| `conda env remove -n <env name>`             | remove environment                        |
| `conda search <package name>`                | search for a package                      |
| `conda update --all`                         | update all packages                       |


For all commands refer [conda cheat sheet](https://docs.conda.io/projects/conda/en/latest/user-guide/cheatsheet.html)

## Poetry

With its `pyproject.toml` file, it makes little cleaner to manage projects. 
![Poetry](@/assets/blog_resources/poetry_isin.png)

Install poetry with `curl`.

```shell
curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -
```

If python is not found, replace it with `python3`. This could happen if you are using `oh-my-zsh` shell.

```shell
curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python3 -
```

Initialise an environment. This automatically creates a `.toml` file in the directory with all packages.

```shell
poetry init
```

Once initialised, install or update if already installed.

```shell
poetry install

# to update all dependencies
poetry update
```

Adding packages to your project? Just do

```shell
poetry add <package name>
```

🚀 Want to build the package as wheel?

```shell
poetry build
```


### Managing builds with AWS CodeArtifact
`AWS Codeartifact` lets you host codebases across different projects. We can let Poetry know, to source the project not from PyPi 
but from CodeArtifact. 

First the CodeArtifact Url in poetry. For eg if the repository is called CODEBASE, we set the url as below. The repo URL you will get once the repo is set up in CodeArtifact

```shell
poetry config repositories.CODEBASE <URL>
```

Authenticate the `CODEBASE` url in Poetry as; 

```shell
poetry config http-basic.CODEBASE aws $(aws codeartifact get-authorization-token --domain <FOO> --domain-owner <BAR> --query authorizationToken --output text)
```

### Using Project with other depending projects
Once the project is on CodeArtifact, one can simply do `pip install` to install to a project. You have to set up the pip index such that it looks in CodeArtifact first before looking outside for dependencies. Something similar has to be done with Poetry. 


For example in the other project `toml` you would add the package as dependency and a source block as below. 

```yaml
[tool.poetry.dependencies]
MYPACKAGE = { version = "0.0.1", source = "CODEBASE" }

[[[tool.poetry.source]]]
name = "CODEBASE"
url = "CODEARTIFACT_URL"
priority = "primary"
```

Before running `poetry install`, you have to pass the token using the `poetry config` command as above. CodeArtifact 
tokens are temporary, so any person or CI system who installs dependencies this way will need to have an 
active token and have set up the correct environment variables. 

### Using Tokens with Container images
To build images with private package dependencies like this one, you can pass the CodeArtifact token as a build 
argument like this;. In the container of course you need to specify the token is an environment variable like `ARG CODEARTIFACT_TOKEN`. 

```shell
docker build -t my-application --build-arg CODEARTIFACT_TOKEN .
```

💫 With this you can seemlessly host projects within the organisation. 

### Some practical tips

1. *Do not install* from `pip`. Always use the `curl` method as above.
2. Poetry installs envs in your `.cache/` directory. This below command will install in your working directory if that's
   the way you work.
  ```shell
  poetry config virtualenvs.in-project true
  ```