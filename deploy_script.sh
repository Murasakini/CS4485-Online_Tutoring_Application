#!/bin/bash

# Pull latest code and restart Docker containers
git pull
git checkout main
git pull
sudo docker-compose down
sudo docker-compose -f docker-compose-prod.yml up --build -d

# Clean up Docker environment
sudo docker system prune -f
sudo docker volume prune -a -f