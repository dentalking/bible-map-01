.PHONY: help init dev stop clean logs shell-frontend shell-backend shell-db build test

# Colors for terminal output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo '${GREEN}BibleMap Development Commands${NC}'
	@echo ''
	@echo 'Usage:'
	@echo '  ${YELLOW}make${NC} ${GREEN}<command>${NC}'
	@echo ''
	@echo 'Commands:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  ${YELLOW}%-15s${NC} %s\n", $$1, $$2}'

init: ## Initialize the project (install dependencies, setup database)
	@echo "${GREEN}Initializing BibleMap project...${NC}"
	@docker-compose build --no-cache
	@echo "${GREEN}Project initialized successfully!${NC}"

dev: ## Start development environment
	@echo "${GREEN}Starting development environment...${NC}"
	@docker-compose up -d
	@echo "${GREEN}Development environment is running!${NC}"
	@echo "${YELLOW}Frontend:${NC} http://localhost:3001"
	@echo "${YELLOW}Backend API:${NC} http://localhost:4000"
	@echo "${YELLOW}pgAdmin:${NC} http://localhost:5050"
	@echo ""
	@echo "${GREEN}Run 'make logs' to see container logs${NC}"

stop: ## Stop all containers
	@echo "${YELLOW}Stopping all containers...${NC}"
	@docker-compose stop

down: ## Stop and remove all containers
	@echo "${RED}Stopping and removing all containers...${NC}"
	@docker-compose down

clean: ## Clean up everything (containers, volumes, images)
	@echo "${RED}Cleaning up everything...${NC}"
	@docker-compose down -v --rmi all

logs: ## View logs from all containers
	@docker-compose logs -f

logs-frontend: ## View frontend logs
	@docker-compose logs -f frontend

logs-backend: ## View backend logs
	@docker-compose logs -f backend

logs-db: ## View database logs
	@docker-compose logs -f postgres

shell-frontend: ## Open shell in frontend container
	@docker exec -it biblemap-frontend sh

shell-backend: ## Open shell in backend container
	@docker exec -it biblemap-backend sh

shell-db: ## Open PostgreSQL shell
	@docker exec -it biblemap-postgres psql -U biblemap -d biblemap

redis-cli: ## Open Redis CLI
	@docker exec -it biblemap-redis redis-cli

build: ## Build all containers
	@echo "${GREEN}Building containers...${NC}"
	@docker-compose build

rebuild: ## Rebuild containers without cache
	@echo "${GREEN}Rebuilding containers...${NC}"
	@docker-compose build --no-cache

test: ## Run tests
	@echo "${GREEN}Running tests...${NC}"
	@docker-compose exec frontend npm test
	@docker-compose exec backend npm test

migrate: ## Run database migrations
	@echo "${GREEN}Running database migrations...${NC}"
	@docker-compose exec backend npm run migrate

seed: ## Seed database with sample data
	@echo "${GREEN}Seeding database...${NC}"
	@docker-compose exec backend npm run seed

backup: ## Backup database
	@echo "${GREEN}Creating database backup...${NC}"
	@docker exec biblemap-postgres pg_dump -U biblemap biblemap > ./database/backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "${GREEN}Backup created successfully!${NC}"

restore: ## Restore database from latest backup
	@echo "${YELLOW}Restoring database from latest backup...${NC}"
	@docker exec -i biblemap-postgres psql -U biblemap biblemap < $$(ls -t ./database/backups/*.sql | head -1)
	@echo "${GREEN}Database restored successfully!${NC}"