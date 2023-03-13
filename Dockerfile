FROM ruby:2.5

RUN bundle config --global forzen 1

WORKDIR /page-build

COPY . /

RUN bundle install

EXPOSE 4000

CMD ["jekyll", "serve"]