import a from './images/a.png';
import b from './images/b.png';
import 'babel-polyfill';

let $ = document.querySelector.bind(document);
window.addEventListener('load', () => new App().main());

class App {
    constructor() {
        this.$button = $('#button');
        this.$image = $('#image');
        this.$log = $('#log');

        // File handle returned from window.chooseFileSystemEntries
        this.handle = null;
        // State = index of one of two sample images
        this.state = false;
        // Binary contents of those two images
        this.images = [];

        this.$button.onclick = this.onclick.bind(this);
    }

    async main() {
        this.checkFilesystem();
        await this.loadImages();
    }

    async onclick() {
        if (!this.handle) {
            await this.pickFile();
            this.$button.innerText = 'Switch image';
        } else {
            this.state = !this.state;
            this.$image.src = this.state ? b : a;
            this.writeCurrent();
        }
    }

    checkFilesystem() {
        if ('chooseFileSystemEntries' in window) {
            let message = 'Filesystem API check OK';
            this.$log.innerText = message;
            console.log(message);
        } else {
            let message = 'Filesystem API not supported';
            this.$log.innerText = message;
            this.$log.style.color = '#f55';
            this.$button.style.display = 'none';
            throw new Error(message);
        }
    }

    async loadImages() {
        for (let url of [a, b]) {
            let res = await fetch(url);
            let blob = await res.blob();
            this.images.push(blob);
        }
    }

    async pickFile() {
        let message = 'Requesting file handle...';
        this.$log.innerText = message;
        console.log(message);

        let opts = {
            type: 'saveFile',
            accepts: [{
                description: 'Image',
                extensions: ['png'],
                mimeTypes: ['image/png'],
            }],
        };
        this.handle = await window.chooseFileSystemEntries(opts);
        console.log('Got handle object:', this.handle);
        await this.writeCurrent();
    }

    async writeCurrent() {
        if (!this.handle) return;
        try {
            let writer = await this.handle.createWriter();
            await writer.truncate(0);
            await writer.write(0, this.images[+this.state]);
            await writer.close();
        } catch (err) {
            this.$log.innerText = err.message;
            this.$log.style.color = '#f55';
            throw err;
        }

        let message = `Synced image ${'AB'[+this.state]} with filesystem`;
        this.$log.innerText = message;
        console.log(message);
    }
}
