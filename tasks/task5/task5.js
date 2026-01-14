document.addEventListener('DOMContentLoaded', () => {

    const area = document.getElementById('dragArea');
    const pieces = document.querySelectorAll('.piece');

    let active = null;
    let offsetX = 0;
    let offsetY = 0;

    pieces.forEach(p => {

        // старт внутри области
        p.style.left = Math.random() * (area.clientWidth - p.offsetWidth) + 'px';
        p.style.top  = Math.random() * (area.clientHeight - p.offsetHeight) + 'px';

        // случайный начальный поворот
        const angles = [0, 90, 180, 270];
        let rot = angles[Math.floor(Math.random() * angles.length)];
        p.dataset.rotCur = rot;
        p.style.transform = `rotate(${rot}deg)`;

        // начало перетаскивания
        p.addEventListener('mousedown', e => {
            active = p;
            offsetX = e.offsetX;
            offsetY = e.offsetY;
            p.style.zIndex = 10;
        });

        // поворот по ПКМ
        p.addEventListener('contextmenu', e => {
            e.preventDefault();
            let r = (parseInt(p.dataset.rotCur) + 90) % 360;
            p.dataset.rotCur = r;
            p.style.transform = `rotate(${r}deg)`;
        });
    });

    // ЕДИНСТВЕННЫЙ mousemove
    document.addEventListener('mousemove', e => {
        if (!active) return;

        const rect = area.getBoundingClientRect();

        let x = e.clientX - rect.left - offsetX;
        let y = e.clientY - rect.top  - offsetY;

        // ограничение по границам арены
        x = Math.max(0, Math.min(x, area.clientWidth  - active.offsetWidth));
        y = Math.max(0, Math.min(y, area.clientHeight - active.offsetHeight));

        active.style.left = x + 'px';
        active.style.top  = y + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (active) {
            active.style.zIndex = 1;
        }
        active = null;
    });

});
