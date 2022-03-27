function slideToObjectAndAttach(game: GetOnBoardGame, object: HTMLElement, destinationId: string, posX?: number, posY?: number): Promise<boolean> {
    const destination = document.getElementById(destinationId);
    if (destination.contains(object)) {
        return Promise.resolve(true);
    }

    return new Promise(resolve => {
        const originalZIndex = Number(object.style.zIndex);
        object.style.zIndex = '10';

        const objectCR = object.getBoundingClientRect();
        const destinationCR = destination.getBoundingClientRect();

        const deltaX = destinationCR.left - objectCR.left + (posX ?? 0);
        const deltaY = destinationCR.top - objectCR.top + (posY ?? 0);

        const attachToNewParent = () => {
            object.style.top = posY !== undefined ? `${posY}px` : 'unset';
            object.style.left = posX !== undefined ? `${posX}px` : 'unset';
            object.style.position = (posX !== undefined || posY !== undefined) ? 'absolute' : 'relative';
            object.style.zIndex = originalZIndex ? ''+originalZIndex : 'unset';
            object.style.transform = 'unset';
            object.style.transition = 'unset';
            destination.appendChild(object);
        }

        if (document.visibilityState === 'hidden' || (game as any).instantaneousMode) {
            // if tab is not visible, we skip animation (else they could be delayed or cancelled by browser)
            attachToNewParent();
        } else {
            object.style.transition = `transform 0.5s ease-in`;
            object.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

            let securityTimeoutId = null;

            const transitionend = () => {
                attachToNewParent();
                object.removeEventListener('transitionend', transitionend);
                object.removeEventListener('transitioncancel', transitionend);
                resolve(true);

                if (securityTimeoutId) {
                    clearTimeout(securityTimeoutId);
                }
            };

            object.addEventListener('transitionend', transitionend);
            object.addEventListener('transitioncancel', transitionend);

            // security check : if transition fails, we force tile to destination
            securityTimeoutId = setTimeout(() => {
                if (!destination.contains(object)) {
                    attachToNewParent();
                    object.removeEventListener('transitionend', transitionend);
                    object.removeEventListener('transitioncancel', transitionend);
                    resolve(true);
                }
            }, 700);
        }
    });
}
function slideToObjectTicketSlot2(game: GetOnBoardGame, object: HTMLElement, destinationId: string, keepTransform: string): Promise<boolean> {
    const destination = document.getElementById(destinationId);
    if (destination.contains(object)) {
        return Promise.resolve(true);
    }

    return new Promise(resolve => {
        const originalZIndex = Number(object.style.zIndex);
        object.style.zIndex = '10';
        
        const slot1left = Number(window.getComputedStyle(document.getElementById('ticket-slot-1')).left.match(/\d+/)[0]);
        const slot2left = Number(window.getComputedStyle(document.getElementById('ticket-slot-2')).left.match(/\d+/)[0]);

        const deltaX = slot2left - slot1left;

        const attachToNewParent = () => {
            object.style.zIndex = originalZIndex ? ''+originalZIndex : 'unset';
            object.style.transform = keepTransform ?? 'unset';
            object.style.transition = 'unset';
            destination.appendChild(object);
        }

        if (document.visibilityState === 'hidden' || (game as any).instantaneousMode) {
            // if tab is not visible, we skip animation (else they could be delayed or cancelled by browser)
            attachToNewParent();
        } else {
            object.style.transition = `transform 0.5s ease-in`;
            object.style.transform = `translateX(${deltaX}px) ${keepTransform ?? ''}`;

            let securityTimeoutId = null;

            const transitionend = () => {
                attachToNewParent();
                object.removeEventListener('transitionend', transitionend);
                object.removeEventListener('transitioncancel', transitionend);
                resolve(true);

                if (securityTimeoutId) {
                    clearTimeout(securityTimeoutId);
                }
            };

            object.addEventListener('transitionend', transitionend);
            object.addEventListener('transitioncancel', transitionend);

            // security check : if transition fails, we force tile to destination
            securityTimeoutId = setTimeout(() => {
                if (!destination.contains(object)) {
                    attachToNewParent();
                    object.removeEventListener('transitionend', transitionend);
                    object.removeEventListener('transitioncancel', transitionend);
                    resolve(true);
                }
            }, 700);
        }
    });
}