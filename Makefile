# Makefile

# Nom du service (peut être redéfini via la ligne de commande)
NAME ?= mon_service

# Cible par défaut
all: up

.PHONY: up
up:
	@echo "Lancement et rebuild avec bun"
	# bun run build
	bun run dev
