#!/bin/bash

# APLICAR NOVO BRANDING - BeckerMonitoramento

GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   APLICAR BRANDING BECKERMON       ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════╝${NC}\n"

[ "$EUID" -ne 0 ] && echo -e "${RED}Execute com sudo!${NC}" && exit 1

FRONTEND="/var/www/sivi/frontend"
DASHBOARD="$FRONTEND/src/components/Dashboard.tsx"

# Verificar se arquivo existe
if [ ! -f "$DASHBOARD" ]; then
    echo -e "${RED}❌ Dashboard.tsx não encontrado!${NC}"
    exit 1
fi

# Backup
echo -e "${BLUE}1/3 - Backup${NC}"
cp "$DASHBOARD" "${DASHBOARD}.bak_$(date +%Y%m%d_%H%M%S)"
echo -e "  ${GREEN}✅${NC} Backup criado\n"

# Copiar novo Dashboard
echo -e "${BLUE}2/3 - Aplicando novo branding${NC}"
if [ -f "Dashboard.tsx" ]; then
    cp Dashboard.tsx "$DASHBOARD"
    echo -e "  ${GREEN}✅${NC} Dashboard.tsx atualizado\n"
else
    echo -e "${RED}❌ Arquivo Dashboard.tsx não encontrado no diretório atual${NC}"
    echo -e "${CYAN}Execute este script no mesmo diretório do Dashboard.tsx${NC}"
    exit 1
fi

# Rebuild
echo -e "${BLUE}3/3 - Rebuild do frontend${NC}"
cd "$FRONTEND"
echo -e "${CYAN}Limpando cache...${NC}"
rm -rf node_modules/.cache dist .vite 2>/dev/null

echo -e "${CYAN}Compilando (aguarde 2-3 min)...${NC}"
npm run build 2>&1 | tail -10

if [ -d "dist" ]; then
    echo -e "\n${GREEN}✅ Build concluído!${NC}"
    
    # Reiniciar nginx
    systemctl restart nginx 2>/dev/null
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     BRANDING ATUALIZADO! 🎨        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════╝${NC}\n"
    
    echo -e "${CYAN}Novo branding:${NC}"
    echo "  • Logo: B branco com rotação 2° e sombra"
    echo "  • Título: BeckerMonitoramento (colorido)"
    echo "  • Subtítulo: SaaS Educacional"
    echo "  • Descrição: SIVI - Sistema de Indexação de Vídeos"
    echo ""
    echo -e "${BLUE}IMPORTANTE:${NC}"
    echo "  1. Ctrl + Shift + Delete"
    echo "  2. Limpar cache de imagens"
    echo "  3. Ctrl + F5 para recarregar"
    echo ""
else
    echo -e "\n${RED}❌ Build falhou!${NC}"
    journalctl -xe | tail -20
fi
