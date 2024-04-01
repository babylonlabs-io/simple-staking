clean:
	$(RM) -r node_modules

build-docker: clean-docker
	docker build -t babylonchain/simple-staking .

clean-docker:
	docker rmi babylonchain/simple-staking 2>/dev/null; true

start-docker: stop-docker build-docker
	docker-compose up -d

stop-docker:
	docker-compose down


.PHONY=clean build-docker clean-docker start-docker stop-docker
