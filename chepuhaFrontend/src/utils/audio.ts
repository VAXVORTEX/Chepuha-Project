export let secretAudio: HTMLAudioElement | null = null;
export const playSecretMusic = () => {
    if (!secretAudio) {
        secretAudio = new Audio('music.mp3');
    }
    if (secretAudio.paused) {
        secretAudio.play().catch(e => {
        });
    } else {
        secretAudio.pause();
    }
};