document.addEventListener('DOMContentLoaded', () => {
    const rtlToggleBtn = document.getElementById('rtl-toggle');

    // Load saved direction
    const currentDir = localStorage.getItem('dir');
    if (currentDir) {
        document.body.setAttribute('dir', currentDir);
    }

    const updateIcon = () => {
        const isRtl = document.body.getAttribute('dir') === 'rtl';
        // rtlToggleBtn.textContent = isRtl ? 'ltr' : 'rtl'; 
        rtlToggleBtn.textContent = '🌐';
    };

    if (rtlToggleBtn) {
        updateIcon(); // Init
        rtlToggleBtn.addEventListener('click', () => {
            const current = document.body.getAttribute('dir');
            const next = current === 'rtl' ? 'ltr' : 'rtl';
            document.body.setAttribute('dir', next);
            localStorage.setItem('dir', next);
            updateIcon();
        });
    }
});
