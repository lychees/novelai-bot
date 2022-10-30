# 配置项

## 登录设置

### type

- 类型：`'login' | 'token' | 'naifu' | 'sd-webui'`
- 默认值：`'token'`

登录方式。`login` 表示使用账号密码登录，`token` 表示使用授权令牌登录。`naifu` 和 `sd-webui` 对应着其他类型的后端。

### email

- 类型：`string`
- 当 `type` 为 `login` 时必填

你的账号邮箱。

### password

- 类型：`string`
- 当 `type` 为 `login` 时必填

你的账号密码。

### token

- 类型：`string`
- 当 `type` 为 `token` 时必填

授权令牌。获取方式如下：

1. 在网页中登录你的 NovelAI 账号
2. 打开控制台 (F12)，并切换到控制台 (Console) 标签页
3. 输入下面的代码并按下回车运行

```js
console.log(JSON.parse(localStorage.session).auth_token)
```

4. 输出的字符串就是你的授权令牌

### endpoint

- 类型：`string`
- 默认值：`'https://api.novelai.net'`
- 当 `type` 为 `naifu` 或 `sd-webui` 时必填

API 服务器地址。如果你搭建了私服，可以将此项设置为你的服务器地址。

### headers

- 类型：`Dict<string>`
- 默认值：官服的 `Referer` 和 `User-Agent`

要附加的额外请求头。如果你的 `endpoint` 是第三方服务器，你可能需要设置正确的请求头，否则请求可能会被拒绝。

## 参数设置

### model

- 类型：`'safe' | 'nai' | 'furry'`
- 默认值：`'nai'`

默认的生成模型。

### orient

- 类型：`'portrait' | 'square' | 'landscape'`
- 默认值：`'portrait'`

默认的图片方向。

### sampler

- 类型：`'k_euler_ancestral' | 'k_euler' | 'k_lms' | 'plms' | 'ddim'`
- 默认值：`'k_euler_ancestral'`

默认的采样器。

### maxSteps

- 类型：`number`

选项 `--steps` 的最大值。

### maxResolution

- 类型：`number`

选项 `--resolution` 中边长的最大值。

## 输入设置

### basePrompt

- 类型: `string`
- 默认值: `'masterpiece, best quality'`

所有请求的附加标签。默认值相当于网页版的「Add Quality Tags」功能。

### negativePrompt

- 类型: `string`
- 默认值: 
  ```
  nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers,
  extra digit, fewer digits, cropped, worst quality, low quality,
  normal quality, jpeg artifacts, signature, watermark, username, blurry
  ```

所有请求附加的负面标签。默认值相当于网页版的「Low Quality + Bad Anatomy」排除。

### forbidden

- 类型：`string`
- 默认值：`''`

违禁词列表。含有违禁词的请求将被拒绝。

## 高级设置

### output

- 类型：`'minimal' | 'default' | 'verbose'`
- 默认值：`'default'`

输出方式。`minimal` 表示只发送图片，`default` 表示发送图片和关键信息，`verbose` 表示发送全部信息。

### allowAnlas

- 类型：`boolean`
- 默认值：`true`

是否允许使用点数。禁用后部分功能 (如图片增强和步数设置) 将无法使用。

### requestTimeout

- 类型：`number`
- 默认值：`30000`

当请求超过这个时间时会中止并提示超时。

<!-- ### recallTimeout

- 类型：`number`
- 默认值：`0`

图片发送后自动撤回的时间 (设置为 `0` 禁用此功能)。 -->

### maxConcurrency

- 类型：`number`
- 默认值：`0`

单个频道下的最大并发数量 (设置为 `0` 以禁用此功能)。
