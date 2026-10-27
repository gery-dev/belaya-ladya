// Включает стили плавного появления только если JavaScript работает
document.documentElement.classList.add('js');

// Приводит любой ввод (9991234567, 89991234567, +79991234567) к виду +7 (999) 123-45-67
function formatPhone(raw) {
    let digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    if (digits[0] === '8') digits = '7' + digits.slice(1);
    else if (digits[0] !== '7') digits = '7' + digits;
    const d = digits.slice(1, 11);

    let out = '+7';
    if (d.length > 0) out += ' (' + d.slice(0, 3);
    if (d.length > 3) out += ') ' + d.slice(3, 6);
    if (d.length > 6) out += '-' + d.slice(6, 8);
    if (d.length > 8) out += '-' + d.slice(8, 10);
    return out;
}

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

    // Тень шапки, кнопка «Наверх», подсветка раздела в меню
    const header = document.querySelector('.site-header');
    const toTop = document.getElementById('to-top');
    const navLinks = Array.from(nav.querySelectorAll('a[href^="#"]'));
    const navTargets = navLinks.map((link) => document.querySelector(link.getAttribute('href')));
    const SHOW_TO_TOP_AFTER = 600;
    const ACTIVE_LINE = 120; // линия под шапкой, по которой определяем текущий раздел

    function onScroll() {
        const y = window.scrollY;
        header.classList.toggle('is-scrolled', y > 8);
        toTop.classList.toggle('is-visible', y > SHOW_TO_TOP_AFTER);

        navLinks.forEach((link, i) => {
            const section = navTargets[i];
            let active = false;
            if (section) {
                const rect = section.getBoundingClientRect();
                active = rect.top <= ACTIVE_LINE && rect.bottom > ACTIVE_LINE;
            }
            link.classList.toggle('is-active', active);
            if (active) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
        });
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            onScroll();
            ticking = false;
        });
    }, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    toTop.addEventListener('click', () => {
        window.scrollTo({ top: 0 });
        document.getElementById('main').focus({ preventScroll: true });
    });

    // Маска телефона
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', () => {
        const formatted = formatPhone(phoneInput.value);
        if (formatted !== phoneInput.value) phoneInput.value = formatted;
    });

    // Проверка формы
    const form = document.getElementById('form');
    const nameInput = document.getElementById('name');
    const policyInput = document.getElementById('policy');
    const submitBtn = form.querySelector('button[type="submit"]');
    const status = document.getElementById('form-status');

    const rules = [
        {
            input: nameInput,
            message: 'Введите имя — не меньше двух букв',
            isValid: () => (nameInput.value.match(/\p{L}/gu) || []).length >= 2,
        },
        {
            input: phoneInput,
            message: 'Введите номер полностью: 11 цифр',
            isValid: () => phoneInput.value.replace(/\D/g, '').length === 11,
        },
        {
            input: policyInput,
            message: 'Нужно согласие с политикой конфиденциальности',
            isValid: () => policyInput.checked,
        },
    ];

    function check(rule) {
        const valid = rule.isValid();
        rule.input.setAttribute('aria-invalid', String(!valid));
        document.getElementById(rule.input.id + '-error').textContent = valid ? '' : rule.message;
        return valid;
    }

    // После первой ошибки поле перепроверяется сразу при вводе
    rules.forEach((rule) => {
        const eventName = rule.input.type === 'checkbox' ? 'change' : 'input';
        rule.input.addEventListener(eventName, () => {
            if (rule.input.getAttribute('aria-invalid') === 'true') check(rule);
        });
    });

    form.addEventListener('input', () => {
        status.textContent = '';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        status.textContent = '';

        const results = rules.map(check);
        const firstInvalid = rules.find((_, i) => !results[i]);
        if (firstInvalid) {
            firstInvalid.input.focus();
            return;
        }

        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Отправка...';

        // Имитация отправки на сервер
        await new Promise((res) => setTimeout(res, 1500));

        form.reset();
        rules.forEach((rule) => rule.input.removeAttribute('aria-invalid'));
        submitBtn.classList.remove('loading');
        submitBtn.classList.add('is-done');
        submitBtn.textContent = 'Готово!';
        status.textContent = 'Заявка отправлена';

        // Возвращаем кнопку через 2 секунды
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.classList.remove('is-done');
            submitBtn.textContent = 'Записаться на занятие';
        }, 2000);
    });
});
