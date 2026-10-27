// Включает стили плавного появления только если JavaScript работает
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
    // Бургер-меню
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');

    function setMenu(open) {
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
        nav.classList.toggle('is-open', open);
    }

    burger.addEventListener('click', () => {
        setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });

    // Закрытие меню при клике на ссылку (мобильная версия)
    nav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && window.innerWidth < 769) {
            setMenu(false);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
            setMenu(false);
            burger.focus();
        }
    });

    // Плавное появление блоков при прокрутке
    const revealItems = document.querySelectorAll('.reveal');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !('IntersectionObserver' in window)) {
        revealItems.forEach((el) => el.classList.add('is-visible'));
    } else {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        revealItems.forEach((el) => observer.observe(el));
    }

    // Маска телефона
    const phoneInput = document.querySelector('input[name="phone"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.startsWith('7') && value.length > 1) value = '7' + value.slice(1);
            if (value.length === 1 && value !== '7') value = '+7';
            if (value.length > 1) {
                value = '+7 (' + value.slice(1, 4);
                if (value.length > 6) value += ') ' + value.slice(4, 7);
                if (value.length > 10) value += '-' + value.slice(7, 9);
                if (value.length > 12) value += '-' + value.slice(9, 11);
            }
            e.target.value = value;
        });
    }

    // Форма отправки
    const form = document.getElementById('form');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Отправка...';

        // Имитация отправки на сервер
        await new Promise((res) => setTimeout(res, 1500));

        submitBtn.classList.remove('loading');
        submitBtn.classList.add('is-done');
        submitBtn.textContent = 'Готово!';

        // Сброс формы через 2 секунды
        setTimeout(() => {
            form.reset();
            submitBtn.disabled = false;
            submitBtn.classList.remove('is-done');
            submitBtn.textContent = 'Записаться на занятие';
        }, 2000);
    });
});
