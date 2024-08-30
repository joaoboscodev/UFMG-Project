#!/bin/bash

# Função para verificar o último comando e sair em caso de erro
check_error() {
    if [ $? -ne 0 ]; then
        echo "$1"
        echo "Abortando..."
        exit 1
    fi
}

echo "Instalando dependências principais..."
cd UFMG-Project || { echo "Erro: Diretório UFMG-Project não encontrado."; exit 1; }
npm install
check_error "Erro ao instalar dependências principais."

echo
echo "Instalando dependências do Rendertron..."
cd rendertron || { echo "Erro: Diretório rendertron não encontrado."; exit 1; }
echo "Diretório atual: $(pwd)"
npm install
check_error "Erro ao instalar dependências do Rendertron."

npx playwright install
check_error "Erro ao instalar o Playwright."

cd .. || exit
echo

echo "Instalando dependências do servidor..."
cd server || { echo "Erro: Diretório server não encontrado."; exit 1; }
echo "Diretório atual: $(pwd)"
npm install
check_error "Erro ao instalar dependências do servidor."

cd .. || exit
echo

echo "Instalando dependências do cliente..."
cd client || { echo "Erro: Diretório client não encontrado."; exit 1; }
echo "Diretório atual: $(pwd)"
npm install
check_error "Erro ao instalar dependências do cliente."

cd .. || exit
echo

echo "Todas as dependências foram instaladas com sucesso."
echo "Aguardando 10 segundos para fechar..."
sleep 10

cd ./rendertron || exit
echo "Startando Rendertron..."
npm start &

sleep 20

# Iniciando o cliente
cd ../client || exit 
echo "Startando client..."
printf "y\n" | npm start &

# Aguardar 3 segundos antes de iniciar o próximo serviço
sleep 3

# Iniciando o servidor backend
cd ../server || exit
echo "Startando server..."
npm run dev &

# Mantém o script ativo para que os servidores rodem
wait
