'use strict';
var ToolList = [
  { name: '二维码', href: '/demo/qrcode' },
];

var Navbar = san.defineComponent({
  template: `
    <div class="navbar">
      <div class="main">
        <a class="home" href="/">Home</a>
        <span class="info">by fenpan 2019/11/07</span>
      </div>
      <span s-for="item,index in waves" class="wave" style="left: {{(index - 1) * distance}}px; animation-delay: {{-index * 1}}s;"></span>
    </div>
  `,

  computed: {
    waves() {
      return new Array(this.data.get('waveCount') + 1).join('.').split('');
    }
  },

  initData() {
    var distance = 190;
    return {
      distance: distance,
      waveCount: Math.ceil(window.innerWidth / distance) + 1
    };
  },

  attached() {
    var ctx = this;
    var timer = null;
    window.addEventListener('resize', function() {
      clearTimeout(timer);
      timer = setTimeout(function() {
        var distance = ctx.data.get('distance');
        ctx.data.set('waveCount', Math.ceil(window.innerWidth / distance) + 1);
      }, 300);
    });
  }
});

var Content = san.defineComponent({
  template: `
    <div class="content main" s-transition="opacity">
      <div class="menu">
        <a href="javascript:;" s-for="item,i in list" on-click="select(i)" class="{{ index == i ? 'on' : '' }}">{{ item.name }}</a>
      </div>
      <div class="preview">
        <div class="wrap" s-if="href" s-transition="opacity">
          <iframe src="{{ href }}"></iframe>
        </div>
        <div class="waiting" s-else  s-transition="opacity"></div>
      </div>
    </div>
  `,

  computed: {
    href() {
      return (this.data.get('list')[this.data.get('index')] || {}).href;
    }
  },
  
  initData() {
    return {
      index: -1,
      list: []
    }
  },

  opacity: {
    enter(el, done) {
      el.classList.add('opacity-anm');
      el.style.opacity = 0;
      tri(el.clientWidth);
      el.style.opacity = 1;
      setTimeout(function() {
        done();
        el.classList.remove('opacity-anm');
      }, 400);
    },
    leave(el, done) {
      el.classList.remove('opacity-anm');
      el.style.opacity = 1;
      tri(el.clientWidth);
      el.style.opacity = 0;
      setTimeout(function() {
        done();
        el.classList.remove('opacity-anm');
      }, 400);
    }
  },

  select(index) {
    this.data.set('index', index);
  }
});

var App = san.defineComponent({
  template: `
    <div class="app">
      <navbar />
      <content list="{{ list }}" />
    </div>
  `,

  components: {
    'navbar': Navbar,
    'content': Content,
  },

  initData() {
    return {
      list: []
    };
  }
});

var app = new App({
  data: {
    list: ToolList
  }
});
var elApp = document.getElementById('app');
var elLoading = document.getElementById('loading');
app.attach(elApp);

setTimeout(function() {
  elLoading.className += ' fadeout';
}, 200);

/** 用于触发部分场景 */
function tri() {}