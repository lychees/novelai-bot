# 用法

## 基本用法

### 从文本生成图片 (text2img)

输入「约稿」+ 关键词进行图片绘制。例如：

```
约稿 koishi
```

### 从图片生成图片 (img2img)

::: warning
此功能在关闭 [allowAnlas](./config.md#allowAnlas) 后不可用。
:::

输入「约稿」+ 图片 + 关键词 进行图片绘制。例如：

```
约稿 [图片] koishi
```

### 图片增强 (enhance)

::: warning
此功能在关闭 [allowAnlas](./config.md#allowAnlas) 后不可用。
:::

图片增强用于优化已经生成的图片。输入「增强」+ 图片 + 关键词 进行图片增强。例如：

```
增强 [图片] koishi
```

### 引用图片回复

考虑到某些平台并不支持在一条消息中同时出现图片和文本，我们也允许通过引用回复的方式触发 img2img 和 enhance 功能。例如：

```
> [图片]
> [引用回复] 约稿/增强
```

## 关键词 (prompt)

使用关键词描述你想要的图像。关键词需要为英文，多个关键词之间用逗号分隔。每一个关键词也可以由多个单词组成，单词之间可以用空格或下划线分隔。例如：

```
约稿 long hair, from_above, 1girl
```

::: tip
novelai-bot 同时兼容 novelai 和大部分 stable diffusion webui 的语法。
:::

### 负面关键词

使用 `-u` 或 `negative prompt:` 以添加负面关键词，避免生成不需要的内容。例如：

```
约稿 girl
negative prompt: loli
```

### 影响因子

使用半角方括号 `[]` 包裹关键词以减弱该关键词的权重，使用半角花括号 `{}` 包裹关键词以增强该关键词的权重。例如：

```
约稿 [tears], {spread legs}
```

每一层括号会增强 / 减弱 1.05 倍的权重。也可以通过多次使用括号来进一步增强或减弱关键词的权重。例如：

```
约稿 [[tears]], {{{smile}}}
```

::: tip
除了影响因子外，关键词的顺序也会对生成结果产生影响。越重要的词应该放到越前面。
:::

### 要素混合

使用 `|` 分隔多个关键词以混合多个要素。例如：

```
约稿 cat | frog
```

你将得到一只缝合怪 (字面意义上)。

可以进一步在关键词后添加 `:x` 来指定单个关键词的权重，`x` 的取值范围是 `0.1~100`，默认为 1。例如：

```
约稿 cat :2 | dog
```

这时会得到一个更像猫的猫狗。

### 基础关键词

NovelAI Bot 允许用户配置基础的正面和负面关键词。它们会在请求时被添加在结尾。

如果想要手动忽略这些基础关键词，可以使用 `-O, --override` 参数。

## 高级功能

### 更改生成模型 (model)

可以用 `-m` 或 `--model` 切换生成模型，可选值包括：

- `safe`：较安全的图片
- `nai`：自由度较高的图片 (默认)
- `furry`：福瑞控特攻 (beta)

```
约稿 -m furry koishi
```

### 设置分辨率 (resolution)

::: warning
此选项在图片增强时不可用。
:::

可以用 `-r` 或 `--resolution` 更改图片方向，可选值包括：

- `portrait`：768×512 (默认)
- `square`：640×640
- `landscape`：512×768

```
约稿 -r landscape koishi
```

当启用了 [allowAnlas](./config.md#allowAnlas) 后，你还可以指定图片的具体长宽：

```
约稿 -r 1024x1024 koishi
```

::: tip
由于 Stable Diffusion 的限制，输出图片的长宽都必须是 64 的倍数。当你输入的图片长宽不满足此条件时，我们会自动修改为接近此宽高比的合理数值。
:::

### 切换采样器 (sampler)

可以用 `-s` 或 `--sampler` 设置采样器，可选值包括：

- `k_euler_ancestral` (默认)
- `k_euler`
- `k_lms`
- `plms`
- `ddim`

即使使用了相同的输入，不同的采样器也会输出不同的内容。目前一般推荐使用 `k_euler_ancestral`，因为其能够提供相对稳定的高质量图片生成 (欢迎在 issue 中讨论各种采样器的区别)。

### 随机种子 (seed)

AI 会使用种子来生成噪音然后进一步生成你需要的图片，每次随机生成时都会有一个唯一的种子。使用 `-x` 或 `--seed` 并传入相同的种子可以让 AI 尝试使用相同的路数来生成图片。

```
约稿 -x 1234567890 koishi
```

::: tip
注意：在同一模型和后端实现中，保持所有参数一致的情况下，相同的种子会产生同样的图片。取决于其他参数，后端实现和模型，相同的种子不一定生成相同的图片，但一般会带来更多的相似之处。
:::

### 迭代步数 (steps)

::: warning
此功能在关闭 [allowAnlas](./config.md#allowAnlas) 后不可用。
:::

更多的迭代步数**可能**会有更好的生成效果，但是一定会导致生成时间变长。太多的steps也可能适得其反，几乎不会有提高。

一种做法是先使用较少的步数来进行快速生成来检查构图，直到找到喜欢的，然后再使用更多步数来生成最终图像。

默认情况下的迭代步数为 28 (传入图片时为 50)，28 也是不会收费的最高步数。可以使用 `-t` 或 `--steps` 手动控制迭代步数。

```
约稿 -t 50 koishi
```

### 对输入的服从度 (scale)

服从度较低时 AI 有较大的自由发挥空间，服从度较高时 AI 则更倾向于遵守你的输入。但如果太高的话可能会产生反效果 (比如让画面变得难看)。更高的值也需要更多计算。

有时，越低的 scale 会让画面有更柔和，更有笔触感，反之会越高则会增加画面的细节和锐度。

| 服从度 | 行为 |
| :---: | --- |
| 2~8   | 会自由地创作，AI 有它自己的想法 |
| 9~13  | 会有轻微变动，大体上是对的 |
| 14~18 | 基本遵守输入，偶有变动 |
| 19+   | 非常专注于输入 |

默认情况下的服从度为 12 (传入图片时为 11)。可以使用 `-c` 或 `--scale` 手动控制服从度。

```
约稿 -c 10 koishi
```

### 强度 (strength)

::: tip
注意：该参数仅能在 img2img 或 enhance 中使用。
:::

AI 会参考该参数调整图像构成。值越低越接近于原图，越高越接近训练集平均画风。使用 `-N` 或 `--strength` 手动控制强度。

| 使用方式 | 推荐范围 |
| :---: | --- |
| 捏人 | 0.3~0.7 |
| 草图细化   | 0.2 |
| 细节设计  | 0.2~0.5 |
| 装饰性图案设计 | 0.2~0.36 |
| 照片转背景 | 0.3~0.7 |
| 辅助归纳照片光影 | 0.2~0.4 |

以上取值范围来自微博画师**帕兹定律**的[这条微博](https://share.api.weibo.cn/share/341911942,4824092660994264.html)。

### 噪音 (noise)

::: tip
注意：该参数仅能在 img2img 或 enhance 中使用。
:::

噪音是让 AI 生成细节内容的关键。更多的噪音可以让生成的图片拥有更多细节，但是太高的值会让产生异形，伪影和杂点。

如果你有一张有大片色块的草图，可以调高噪音以产生细节内容，但噪音的取值不宜大于强度。当强度和噪音都为 0 时，生成的图片会和原图几乎没有差别。

使用 `-n` 或 `--noise` 手动控制噪音。
