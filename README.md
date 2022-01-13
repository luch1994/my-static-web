# Local-file-server
## 简单易用的、使用命令行启动的Nodejs简单的静态文件服务器

当我们需要在本地启动一个静态资源的服务器的时候，可以使用我们这个工具

样式预览

<img src="https://s3.bmp.ovh/imgs/2021/12/cbc50343bf4b4256.png" alt="01" style="zoom:50%;" />

全局安装
```sh
npm install -g local-file-server
```

在当前目录下运行
```bash
localserver start
```
或者直接运行
```bash
localserver
```

默认启动在3000端口，也可以指定端口
```bash
localserver start -p 3001
```
在控制台打印request的url
```bash
localserver start -l
```
启动之后，在浏览器打开 <a href="http://localhost:3000">http://localhost:3000</a> 即可