FROM gradle:jdk11

USER root

WORKDIR /code

COPY . .

RUN gradle build --warning-mode all
EXPOSE 4567
ENV FILES_PATH /files/

CMD ["gradle", "run"]