(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{5557:function(e,t,s){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return s(8927)}])},8927:function(e,t,s){"use strict";s.r(t),s.d(t,{default:function(){return m}});var l=s(5893),a=s(7294),c=s(9583),r=s(7735);function i(){let[e,t]=(0,a.useState)([]),[s,i]=(0,a.useState)([]),[n,x]=(0,a.useState)({});return(0,a.useEffect)(()=>{fetch("/api/skills",{method:"get"}).then(e=>e.json()).then(e=>{t(e),x(e[0])}).catch(e=>{let s=[{title:"Python",percent:"95"},{title:"CSS",percent:"70"},{title:"Tailwind CSS",percent:"85"},{title:"JavaScript ES6",percent:"95"},{title:"Django",percent:"90"},{title:"React",percent:"80"}];t(s),x(s[0])}),fetch("/api/languages",{method:"get"}).then(e=>e.json()).then(e=>{i(e)}).catch(e=>{i([{title:"English",percent:"60"}])})},[]),(0,l.jsxs)("div",{className:"bg-card rounded-r-lg overflow-y-auto ",children:[(0,l.jsxs)("div",{className:"flex flex-col items-center justify-center mb-4 p-4",children:[(0,l.jsx)("img",{src:"./img.png",className:"h-20 w-20 rounded-full"}),(0,l.jsx)("h3",{className:"text-white font-bold mt-2 mb-2 text-base",children:"Gustavo Tramonte"}),(0,l.jsx)("p",{className:"text-gray-400 text-sm",children:"Software Developer"})]}),(0,l.jsxs)("div",{className:"flex flex-col justify-center items-center",children:[(0,l.jsxs)("section",{className:"flex w-11/12 flex-col items-center justify-center mt-2",children:[(0,l.jsxs)("div",{className:"w-11/12 flex flex-row justify-between",children:[(0,l.jsx)("p",{className:"text-white text-sm font-bold",children:"Pa\xeds"}),(0,l.jsx)("p",{className:"text-gray-400 text-sm",children:"Brasil"})]}),(0,l.jsxs)("div",{className:"w-11/12 flex flex-row justify-between",children:[(0,l.jsx)("p",{className:"text-white text-sm font-bold",children:"Cidade"}),(0,l.jsx)("p",{className:"text-gray-400 text-sm",children:"Morro Agudo/SP"})]}),(0,l.jsxs)("div",{className:"w-11/12 flex flex-row justify-between",children:[(0,l.jsx)("p",{className:"text-white text-sm font-bold",children:"Idade"}),(0,l.jsx)("p",{className:"text-gray-400 text-sm",children:"20"})]})]}),(0,l.jsx)("span",{className:"w-10/12 border-b-2 border-gray-500 p-1 mt-4 mb-4"}),(0,l.jsx)("section",{className:"flex w-11/12 flex-col items-center justify-center mb-2",children:(0,l.jsx)("div",{className:"w-11/12 flex-col",children:s.map((e,t)=>(0,l.jsxs)(l.Fragment,{children:[(0,l.jsxs)("div",{class:"flex flex-row mb-2 mt-2 justify-between",children:[(0,l.jsx)("p",{className:"text-white font-bold text-sm",children:"English"}),(0,l.jsxs)("p",{className:"text-gray-400 text-sm",children:[e.percent,"%"]})]},t),(0,l.jsx)("div",{className:"bg-gray-700 w-full h-2",children:(0,l.jsx)("div",{className:"bg-mygreen h-2",style:{width:"".concat(e.percent,"%")}})})]}))})}),(0,l.jsx)("span",{className:"w-10/12 border-b-2 border-gray-500 p-1 mt-4 mb-4"}),(0,l.jsxs)("section",{className:"p-4 space-y-4 rounded-xl md:grid md:grid-cols-2 md:gap-2 sm:space-y-0",children:[(0,l.jsx)("div",{className:"grid grid-cols-2 gap-2",children:e.map((t,s)=>(0,l.jsx)("button",{onClick:()=>(function(t){let s=e.filter(e=>e.title===t);x(s[0])})(t.title),className:"px-4 py-2 text-xs font-bold transition text-center bg-mygreen rounded-md h-12 w-20 hover:opacity-70 ".concat(t.title==n.title?"border-white border-2 text-white":"text-gray-800"),children:t.title},s))}),(0,l.jsxs)("div",{className:"flex items-center justify-center",children:[(0,l.jsxs)("svg",{className:"transform -rotate-90 w-44 h-44",children:[(0,l.jsx)("circle",{cx:"90",cy:"90",r:"70",stroke:"currentColor",strokeWidth:"20",fill:"transparent",className:"text-gray-700"}),(null==n?void 0:n.title)&&(0,l.jsx)("circle",{cx:"90",cy:"90",r:"70",stroke:"currentColor",strokeWidth:"20",fill:"transparent",strokeDasharray:44/7*70,strokeDashoffset:44/7*70-n.percent/100*(44/7*70),className:"text-mygreen"})]}),(0,l.jsxs)("span",{className:"absolute text-xl text-white",children:[n.percent,"%"]})]})]})]}),(0,l.jsx)("div",{className:"flex items-center justify-center mb-2 p-4",children:(0,l.jsxs)("div",{className:"grid grid-rows-1 grid-cols-3 gap-4",children:[(0,l.jsx)("a",{href:"https://github.com/MrPowerUp82",className:"text-gray-400 text-2xl",children:(0,l.jsx)(c.hJX,{})}),(0,l.jsx)("a",{href:"https://www.linkedin.com/in/gustavo-henrique-da-silva-tramonte-3ba89320b/",className:"text-gray-400 text-2xl",children:(0,l.jsx)(c.ltd,{})}),(0,l.jsx)("a",{href:"https://pypi.org/user/MrPowerUp/",className:"text-gray-400 text-2xl",children:(0,l.jsx)(r.DLc,{})})]})})]})}var n=s(3253),x=s.n(n),d=s(6893);function o(e){let{isOpen:t,onRequestClose:s}=e;return(0,l.jsxs)(x(),{isOpen:t,onRequestClose:s,style:{content:{top:"50%",bottom:"auto",left:"50%",right:"auto",padding:"32px",transform:"translate(-50%, -50%)",backgroundColor:"#2C2C38"}},children:[(0,l.jsx)("button",{type:"button",onClick:s,className:"react-modal-close",style:{background:"transparent",border:0,marginBottom:2},children:(0,l.jsx)(d.q5L,{size:45,color:"#fff"})}),(0,l.jsxs)("div",{className:"flex flex-col",children:[(0,l.jsx)("p",{className:"text-white font-bold text-lg mt-2",children:"Home"}),(0,l.jsx)("p",{className:"text-white font-bold text-lg mt-2",children:"Certificados"}),(0,l.jsx)("p",{className:"text-white font-bold text-lg mt-2",children:"Hist\xf3ria"})]})]})}function m(){let[e,t]=(0,a.useState)(!1),[s,r]=(0,a.useState)(!1);function n(){s&&r(!1),t(!0)}return x().setAppElement("#__next"),(0,l.jsxs)("div",{className:"flex flex-col",children:[(0,l.jsxs)("div",{className:"md:hidden flex bg-card flex-row justify-between",children:[(0,l.jsx)("div",{onClick:s?function(){r(!1)}:function(){r(!0)},className:"flex items-center justify-center p-4 text-white cursor-pointer",children:s?(0,l.jsx)(d.q5L,{}):(0,l.jsx)(d.$Pu,{})}),(0,l.jsx)("div",{onClick:n,className:"flex items-center justify-center p-4 text-white cursor-pointer",children:(0,l.jsx)(c.Fm7,{})})]}),(0,l.jsxs)("div",{className:"bg-full-background flex flex-row",children:[(0,l.jsx)("div",{className:"hidden md:flex md:w-4/12",children:(0,l.jsx)(i,{})}),s&&(0,l.jsx)("div",{className:"z-10 absolute w-11/12",children:(0,l.jsx)(i,{})}),(0,l.jsx)("div",{className:"w-full md:w-7/12 ".concat(s?"opacity-30":""),children:(0,l.jsxs)("section",{className:"flex flex-col justify-between",children:[(0,l.jsxs)("div",{className:"container mx-auto",children:[(0,l.jsx)("div",{className:"items-center flex flex-wrap",children:(0,l.jsx)("div",{className:"w-full lg:w-6/12 px-4 ml-auto mr-auto text-center",children:(0,l.jsxs)("div",{className:"pr-12",children:[(0,l.jsx)("h1",{className:"text-white mt-4 md:mt-0 font-semibold text-3xl text-left",children:"Descubra o meu incr\xedvel espa\xe7o de trabalho!"}),(0,l.jsxs)("p",{className:"mt-4 text-lg text-gray-300 flex flex-row",children:["<",(0,l.jsx)("p",{className:"text-mygreen",children:"code"}),">","Hello World!","</",(0,l.jsx)("p",{className:"text-mygreen",children:"code"}),">"]})]})})}),(0,l.jsx)("section",{className:"pb-10 mt-24",children:(0,l.jsx)("div",{className:"container mx-auto px-4",children:(0,l.jsxs)("div",{className:"flex flex-wrap",children:[(0,l.jsx)("div",{className:"lg:pt-12 pt-6 w-full md:w-4/12 px-4 text-center",children:(0,l.jsx)("div",{className:"relative flex flex-col min-w-0 break-words bg-card w-full mb-8 shadow-lg rounded-lg",children:(0,l.jsxs)("div",{className:"px-4 py-5 flex-auto",children:[(0,l.jsx)("h6",{className:"text-xl font-semibold text-white text-left",children:"Python"}),(0,l.jsx)("p",{className:"mt-2 mb-4 text-gray-400 text-left",children:"Meu conhecimento em Python v\xeam de uma experi\xeancia de quase 5 anos e faz 1,5 anos que estou trabalhando com a linguagem. Minhas habilidades v\xe3o de automa\xe7\xe3o e web scraping at\xe9 desenvolvimento de aplica\xe7\xf5es web e API 's REST com django e django rest framework respectivamente."})]})})}),(0,l.jsx)("div",{className:"w-full md:w-4/12 px-4 text-center",children:(0,l.jsx)("div",{className:"relative flex flex-col min-w-0 break-words bg-card w-full mb-8 shadow-lg rounded-lg",children:(0,l.jsxs)("div",{className:"px-4 py-5 flex-auto",children:[(0,l.jsx)("h6",{className:"text-xl font-semibold text-white text-left",children:"JavaScript"}),(0,l.jsx)("p",{className:"mt-2 mb-4 text-gray-400 text-left",children:"Em JavaScript meu conhecimento de Statement Syntax vai at\xe9 a ES6, com 2 anos de experi\xeancia e sendo React o framework mais usado por mim."})]})})}),(0,l.jsx)("div",{className:"pt-6 w-full md:w-4/12 px-4 text-center",children:(0,l.jsx)("div",{className:"relative flex flex-col min-w-0 break-words bg-card w-full mb-8 shadow-lg rounded-lg",children:(0,l.jsxs)("div",{className:"px-4 py-5 flex-auto",children:[(0,l.jsx)("h6",{className:"text-xl font-semibold text-white text-left",children:"Go"}),(0,l.jsx)("p",{className:"mt-2 mb-4 text-gray-400 text-left",children:"Com GoLang n\xe3o tenho muito a mostrar, pois comecei a estudar recentemente (h\xe1 uma semana), no meu GitHub voc\xea vai encontrar apenas um projeto que utiliza interface gr\xe1fica."})]})})})]})})})]}),(0,l.jsx)("footer",{children:(0,l.jsxs)("div",{className:"bg-card flex flex-row text-gray-400 items-center justify-start p-5",children:[(0,l.jsx)(c.Sq9,{})," ",(0,l.jsx)("a",{href:"https://github.com/MrPowerUp82",className:"ml-1",children:"MrPowerUp"})]})})]})}),(0,l.jsx)("div",{className:"hidden h-full md:flex md:w-1/12",children:(0,l.jsx)("div",{className:"flex w-full flex-col items-center justify-between",children:(0,l.jsx)("div",{onClick:n,className:"bg-card p-4 text-white mt-2 cursor-pointer",children:(0,l.jsx)(c.Fm7,{})})})}),e&&(0,l.jsx)(o,{isOpen:e,onRequestClose:function(){t(!1)}})]})]})}}},function(e){e.O(0,[415,445,206,774,888,179],function(){return e(e.s=5557)}),_N_E=e.O()}]);