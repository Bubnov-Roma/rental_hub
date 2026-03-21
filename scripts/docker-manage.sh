#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Проверка переменных окружения
check_env() {
    print_header "Проверка переменных окружения"
    
    if [ ! -f .env ]; then
        print_error ".env файл не найден!"
        print_warning "Скопируйте .env.example в .env и заполните переменные"
        exit 1
    fi
    
    # Проверить ключевые переменные
    if ! grep -q "NEXTAUTH_SECRET" .env; then
        print_error "NEXTAUTH_SECRET не установлен в .env"
        exit 1
    fi
    
    print_success ".env файл найден и содержит NEXTAUTH_SECRET"
}

# Очистить старые контейнеры и образы
clean() {
    print_header "Очистка старых контейнеров и кеша Docker"
    
    echo "Остановка контейнеров..."
    docker-compose down -v
    
    echo "Очистка Docker кеша..."
    docker builder prune -af
    
    print_success "Очистка завершена"
}

# Собрать и запустить
build_and_run() {
    print_header "Сборка и запуск приложения"
    
    echo "Экспортирование DOCKER_BUILDKIT..."
    export DOCKER_BUILDKIT=1
    
    echo "Запуск docker-compose build..."
    docker-compose build --no-cache app
    
    if [ $? -ne 0 ]; then
        print_error "Сборка образа не удалась"
        exit 1
    fi
    
    print_success "Образ собран успешно"
    
    echo "Запуск контейнеров..."
    docker-compose up -d
    
    if [ $? -ne 0 ]; then
        print_error "Запуск контейнеров не удалась"
        exit 1
    fi
    
    print_success "Контейнеры запущены"
}

# Проверить статус
check_status() {
    print_header "Статус контейнеров"
    
    docker-compose ps
    
    # Ждем несколько секунд для инициализации
    echo -e "\nОжидание инициализации приложения (30 сек)..."
    sleep 30
    
    # Проверить логи
    echo -e "\n${BLUE}Последние логи приложения:${NC}"
    docker-compose logs app | tail -20
    
    # Попробовать подключиться
    print_header "Проверка доступности"
    
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Приложение доступно на http://localhost:3000"
    else
        print_warning "Приложение еще не готово, проверьте логи: docker-compose logs app"
    fi
}

# Показать помощь
show_help() {
    echo "Использование: $0 [команда]"
    echo ""
    echo "Команды:"
    echo "  build     - Собрать и запустить контейнеры (с очисткой)"
    echo "  start     - Запустить контейнеры без очистки"
    echo "  stop      - Остановить контейнеры"
    echo "  logs      - Показать логи приложения"
    echo "  clean     - Очистить контейнеры и кеш"
    echo "  restart   - Перезагрузить контейнеры"
    echo "  shell     - Зайти в shell контейнера приложения"
    echo "  help      - Показать эту справку"
    echo ""
}

# Основной скрипт
case "${1:-help}" in
    build)
        check_env
        clean
        build_and_run
        check_status
        ;;
    start)
        check_env
        print_header "Запуск контейнеров"
        docker-compose up -d
        check_status
        ;;
    stop)
        print_header "Остановка контейнеров"
        docker-compose down
        print_success "Контейнеры остановлены"
        ;;
    logs)
        docker-compose logs -f app
        ;;
    clean)
        clean
        ;;
    restart)
        print_header "Перезагрузка контейнеров"
        docker-compose restart
        check_status
        ;;
    shell)
        print_header "Подключение к контейнеру приложения"
        docker-compose exec app sh
        ;;
    help)
        show_help
        ;;
    *)
        print_error "Неизвестная команда: $1"
        show_help
        exit 1
        ;;
esac