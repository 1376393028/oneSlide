const $ = s => document.querySelector(s)
const $$ = s => document.querySelectorAll(s)
const isMain = str => /^#{1,2}(?!#)/.test(str)
const isSub = str => /^#{3}(?!#)/.test(str)

function convert(raw) {
    let arr = raw.split(/\n(?=\s*#{1,3}[^#])/).filter(s => s != "").map(s => s.trim())
    let html = ''
    for (let i = 0; i < arr.length; i++) {
        if (arr[i + 1] !== undefined) {
            if (isMain(arr[i]) && isMain(arr[i + 1])) {
                html += `
                <section data-markdown>
                    <textarea data-template>
                        ${arr[i]}
                    </textarea>
                </section>
                `
            } else if (isMain(arr[i]) && isSub(arr[i + 1])) {
                html += `
                <section>
                    <section data-markdown>
                     <textarea data-template>
                        ${arr[i]}
                     </textarea>
                    </section>
                `
            } else if (isSub(arr[i]) && isSub(arr[i + 1])) {
                html += `
                    <section data-markdown>
                     <textarea data-template>
                        ${arr[i]}
                     </textarea>
                    </section>
                `
            } else if (isSub(arr[i]) && isMain(arr[i + 1])) {
                html += `
                    <section data-markdown>
                        <textarea data-template>
                            ${arr[i]}
                        </textarea>
                    </section>
                    </section>
                `
            }
        } else {
            if (isMain(arr[i])) {
                html += `
                    <section data-markdown>
                    <textarea data-template>
                        ${arr[i]}
                    </textarea>
                    </section>
                `
            } else if (isSub(arr[i])) {
                html += `
                    <section data-markdown>
                        <textarea data-template>
                            ${arr[i]}
                        </textarea>
                    </section>
                    </section>
                `
            }
        }
    }

    return html
}

const Menu = {
    init() {
        console.log('Menu init...')
        this.$settingIcon = $('.control .icon-setting')
        this.$menu = $('.menu')
        this.$closeIcon = $('.menu .icon-close')
        this.$$tabs = $$('.menu .tab')
        this.$$contents = $$('.menu .content')
        this.bind()
    },

    bind() {
        this.$settingIcon.onclick = () => {
            this.$menu.classList.add('open')
        }
        this.$closeIcon.onclick = () => 　{
            this.$menu.classList.remove('open')
        }
        this.$$tabs.forEach($tab => $tab.onclick = () => {
            this.$$tabs.forEach($item => $item.classList.remove('active'))
            $tab.classList.add('active')
            let index = [...this.$$tabs].indexOf($tab)
            this.$$contents.forEach($content => $content.classList.remove('active'))
            this.$$contents[index].classList.add('active')
        })
    }
}


const imgUpload = {
    init() {
        this.$fileInput = $('#img-uploader')
        this.$textarea = $('.editor textarea')

        AV.init({
            appId: "8xM9NbOAG9uaf8LHqj51lgze-gzGzoHsz",
            appKey: "GNpaD8L4x8J6z7sOO60VyQW8",
            serverURL: "https://8xm9nboa.lc-cn-n1-shared.com"
        });

        this.bind()
    },
    bind() {
        let self = this
        this.$fileInput.onchange = function() {
            if (this.files.length > 0) {
                let localFile = this.files[0]
                if (localFile.size / 1048576 > 2) {
                    alert('文件不能超过2M')
                    return
                }
                self.insetText(`![上传中，进度0%]()`)
                let avFile = new AV.File(encodeURI(localFile.name), localFile)
                avFile.save({
                    keepFileName: true,
                    onprogress(progress) {
                        self.insetText(`![上传中，进度${progress.percent}%]()`)
                    }
                }).then(file => {
                    console.log('文件保存完成')
                    console.log(file)

                    let text = `![${file.attributes.name}](${file.attributes.url}?imageView2/0/w/800/h/600)`

                    self.insetText(text)
                }).catch(err => console.log(err))
            }
        }

    },
    insetText(text = '') {
        let start = this.$textarea.selectionStart
        let end = this.$textarea.selectionEnd
        let oldText = this.$textarea.value
        this.$textarea.value = `${oldText.substring(0,start)}${text}${oldText.substring(end)}`
        this.$textarea.focus()
        this.$textarea.setSelectionRange(start, start + text.length)
    }

}

const Editor = {
    init() {
        this.$editInput = $('.editor textarea')
        this.$saveBtn = $('.editor .button-save')
        this.markdown = localStorage.markdown || '# one slide'
        this.$slideContainer = $('.slides')
        this.bind()
        this.start()
    },
    bind() {
        this.$saveBtn.onclick = () => {
            localStorage.markdown = this.$editInput.value
            location.reload()
            this.start()
        }
    },
    start() {
        this.$editInput.value = this.markdown
        this.$slideContainer.innerHTML = convert(this.markdown)
            // Also available as an ES module, see:
            // https://revealjs.com/initialization/
        Reveal.initialize({
            controls: true,
            progress: true,
            center: localStorage.align === 'left-top' ? false : true,
            hash: true,
            transition: localStorage.transition || 'slide',
            // Learn about plugins: https://revealjs.com/plugins/
            plugins: [RevealZoom, RevealNotes, RevealSearch, RevealMarkdown, RevealHighlight]
        });
    }
}


const Theme = {
    init() {
        this.theme = 'sky'
        this.$$figures = $$('.themes figure')
        this.$transition = $('.theme .transition')
        this.$align = $('.theme .align')
        this.$reveal = $('.reveal')
        this.bind()
        this.loadTheme()
    },
    bind() {
        this.$$figures.forEach($figure => $figure.onclick = () => {
            this.$$figures.forEach($item => $item.classList.remove('select'))
            $figure.classList.add('select')
            this.setTheme($figure.dataset.theme)
        })
        this.$transition.onchange = function() {
            localStorage.transition = this.value
            location.reload()
        }
        this.$align.onchange = function() {
            localStorage.align = this.value
            location.reload()
        }
    },
    setTheme(theme) {
        localStorage.theme = theme
        location.reload()
    },
    loadTheme() {
        let theme = localStorage.theme || 'sky'
        let $link = document.createElement('link')
        $link.rel = 'stylesheet'
        $link.href = `dist/theme/${theme}.css`
        $link.id = document.head.appendChild($link)
        Array.from(this.$$figures).find($figure => $figure.dataset.theme === theme).classList.add('select')
        this.$transition.value = localStorage.transition || 'slide'
        this.$align.value = localStorage.align || 'center'
        this.$reveal.classList.add(this.$align.value)
    }
}

const Print = {
    init() {
        this.$download = $('.download')
        this.bind()
        this.start()
    },
    bind() {
        this.$download.addEventListener('click', () => {
            let $link = document.createElement('a')
            $link.setAttribute('target', '_blank')
            $link.setAttribute('href', location.href.replace(/#*\/.*/, '?print-pdf'))
            $link.click()
        })

    },
    start() {
        let link = document.createElement('link')
        link.rel = 'stylesheet'
        link.type = 'text/css'
        document.getElementsByTagName('head')[0].appendChild(link)
        if (window.location.search.match(/print-pdf/gi)) {
            link.hrfe = 'css/print/pdf.css'
            window.print()
        } else {
            link.hrfe = 'css/print/paper.css'
        }
        document.head.appendChild(link)
    }
}








const App = {
    init() {
        [...arguments].forEach(Module => Module.init())
    }
}
App.init(Menu, imgUpload, Editor, Theme, Print)