git pull
docker container prune -f
docker image prune -f
docker kill $(docker ps -a -q --filter ancestor=avaice/reversi)
docker rm $(docker ps -a -q --filter ancestor=avaice/reversi)
docker image build -t avaice/reversi ./

docker run -d -p 3002:3000 avaice/reversi