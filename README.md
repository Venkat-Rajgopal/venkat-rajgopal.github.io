# Blog page

I am using `jekyll minimal mistakes`. I sometimes use jupyter notebook and convert them using `nbconvertor` to convert into markdown `.md` files. 

# Build in a container 
```shell
docker run --rm --volume="$PWD:/srv/jekyll" -p 4000:4000 jekyll/jekyll:4.0 jekyll serve
```

Or simply use `docker-compose` as;
```shell
docker-compose up
```


## Usage
- Font sizes
Change font sizes in `assets/css/main.scss`. 

## Build the site locally. 
```
bundle exec jekyll serve
```