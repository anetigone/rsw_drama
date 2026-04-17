云函数支持使用Node.js进行开发。您可将代码提交到云端运行，在客户端使用EMAS Serverless提供的API进行调用。您还可以在云函数中直接通过API调用数据存储和文件存储的服务资源。

**说明**

您可以通过ctx.mpserverless.function.invoke调用其他云函数，详细说明请参见[invoke](https://help.aliyun.com/document_detail/435907.html#topic-2012294)。

## 步骤一：创建云函数

1.  登录[EMAS管理控制台](https://emas.console.aliyun.com/#/productList)，选择 **Serverless**，**点击进入**，进入到Serverless 控制台。
    
2.  在左侧导航栏，选择 **云函数**。
    
3.  单击**新建云函数**。
    
4.  输入函数名称。
    
    函数名称长度在1-30个字符间，只能包含字母、数字、下划线和中划线，不能以数字、中划线开头。 
    
    **重要**
    
    云函数的名称必须和要上传的Node.js代码包名称一致。
    
5.  选择运行环境。[运行时支持列表](https://help.aliyun.com/document_detail/2717618.html)**。**
    
6.  选择函数执行内存，目前支持**128M,256M,512M,1024M,2048M。**
    
7.  输入**描述**。
    
8.  单击**确定**。
    

## 步骤二：定义云函数

1.  云函数目录结构如下。
    
    其中 *index.js*是云函数 `getImageList`的入口文件。
    
    ```
    └── getImageList
            └── index.js
    ```
    
    **说明**
    
    云函数代码包会被解压到临时路径：***/tmp/function***，因此当您需要打开代码包中的文件时，需要在该文件的相对路径前加上临时路径，否则会提示找不到该文件。例如：上述index.js文件在云函数中的全路径为：**/tmp/function/getImageList/index.js**。
    
2.  编写云函数代码。
    
    以下代码示例展示了如何从数据库`images`里面查出特定用户上传的图片记录。 
    
    ```
    module.exports = async (ctx) => {
      const images = await ctx.mpserverless.db.collection('images').find({ owner: ctx.args.username });
      return { images };
    };
    ```
    
    **说明**
    
    云函数的返回值类型仅支持JSON格式。
    

## 步骤三：部署云函数

1.  登录[EMAS管理控制台](https://emas.console.aliyun.com/#/productList)，选择 **Serverless**，**点击进入**，进入到Serverless 控制台。
    
2.  在左侧导航栏，选择 **云函数**。
    
3.  单击已创建的函数名称链接。
    
4.  在**发布管理**页签，单击**上传js包**或**更新js包**，然后选择要上传的代码包。
    
    **说明**
    
    上传的代码包必须满足以下要求：
    
    -   代码包的名称必须和在控制台上创建的函数名称一致。
        
    -   代码包必须是.zip文件。
        
    -   上传的代码包必须包含index.js文件。
        
    -   如果引用了第三方包，代码包里必须包含 node\_modules。
        
    -   单个云函数代码包解压后大小不能超过500MB。
        
    
5.  上传成功后，单击**代码部署**。
    
    ![代码部署](https://help-static-aliyun-doc.aliyuncs.com/assets/img/zh-CN/9031019951/p50070.png)
    

## 步骤四：执行云函数

1.  单击**代码执行**，打开右侧**执行**页面。
    
2.  在**执行参数**区域，输入JSON格式的代码入参，如下图所示。
    
    ![fig1](https://help-static-aliyun-doc.aliyuncs.com/assets/img/zh-CN/5510411661/p479427.png)在**执行结果**区域，可查看函数执行情况。
    

## 步骤五：使用SDK调用云函数

云函数代码部署完成后，在客户端您可以使用`mpserverless.function.invoke`方法调用上述定义的云函数。

以下代码示例展示了如何获取用户上传的图片记录，然后更新页面数据。

```
// 引入MPServerless模块
const MPServerless = require('@alicloud/mpserverless-sdk');  
// 初始化MPServerless对
  appId: '1234456789', // 小程序应用标识象
const mpServerless = new MPServerless({  
  uploadFile: my.uploadFile,
  request: my.request,
  getAuthCode: my.getAuthCode,
}, {
  spaceId: 'db4dd657-7041-470a-90xxxxx', // 服务空间标识
  clientSecret: '6c3c86xxxx6', // 服务空间 secret key
  endpoint: 'https://api.next.bspapp.com', // 服务空间地址，从小程序 serverless 控制台处获得
});
// 调用云函数getImageList
mpServerless.function.invoke('getImageList', {     
  username: 'Vincent',
}).then((res) => {
  if (res.success && res.result) {
    this.setData({ imageList: res.result.images });
  }
}).catch(console.error);
```

## 步骤六：查看日志

1.  登录[EMAS管理控制台](https://emas.console.aliyun.com/#/productList)，选择 **Serverless**，**点击进入**，进入到Serverless 控制台。
    
2.  在左侧导航栏，选择 **云函数**。
    
3.  单击已创建的函数名称链接。
    
4.  单击**日志**。
    
5.  根据执行时间、状态和Request ID等信息过滤您要查看的日志。