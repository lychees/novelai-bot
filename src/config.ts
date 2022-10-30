import { Dict, Schema, Time } from 'koishi'
import { Size } from './utils'

export const modelMap = {
  safe: 'safe-diffusion',
  nai: 'nai-diffusion',
  furry: 'nai-diffusion-furry',
} as const

export const orientMap = {
  landscape: { height: 512, width: 768 },
  portrait: { height: 768, width: 512 },
  square: { height: 640, width: 640 },
} as const

const ucPreset = [
  'nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers',
  'extra digit, fewer digits, cropped, worst quality, low quality',
  'normal quality, jpeg artifacts, signature, watermark, username, blurry',
].join(', ')

type Model = keyof typeof modelMap
type Orient = keyof typeof orientMap

export const models = Object.keys(modelMap) as Model[]
export const orients = Object.keys(orientMap) as Orient[]

export namespace sampler {
  export const nai = {
    'k_euler_a': 'Euler ancestral',
    'k_euler': 'Euler',
    'k_lms': 'LMS',
    'ddim': 'DDIM',
    'plms': 'PLMS',
  }

  export const sd = {
    'k_euler_a': 'Euler a',
    'k_euler': 'Euler',
    'k_lms': 'LMS',
    'k_heun': 'Heun',
    'k_dpm_2': 'DPM2',
    'k_dpm_2_a': 'DPM2 a',
    'k_dpm_fast': 'DPM fast',
    'k_dpm_ad': 'DPM adaptive',
    'k_lms_ka': 'LMS Karras',
    'k_dpm_2_ka': 'DPM2 Karras',
    'k_dpm_2_a_ka': 'DPM2 a Karras',
    'ddim': 'DDIM',
    'plms': 'PLMS',
  }

  export function createSchema(map: Dict<string>) {
    return Schema.union(Object.entries(map).map(([key, value]) => {
      return Schema.const(key).description(value)
    })).description('默认的采样器。').default('k_euler_a')
  }

  export function sd2nai(sampler: string): string {
    if (sampler === 'k_euler_a') return 'k_euler_ancestral'
    if (sampler in nai) return sampler
    return 'k_euler_ancestral'
  }
}

export interface Options {
  enhance: boolean
  model: string
  resolution: Size
  sampler: string
  seed: string
  steps: number
  scale: number
  noise: number
  strength: number
}

export interface Config {
  type: 'token' | 'login' | 'naifu' | 'sd-webui'
  token?: string
  email?: string
  password?: string
  model?: Model
  orient?: Orient
  sampler?: string
  maxSteps?: number
  maxResolution?: number
  anatomy?: boolean
  output?: 'minimal' | 'default' | 'verbose'
  allowAnlas?: boolean | number
  basePrompt?: string
  negativePrompt?: string
  forbidden?: string
  endpoint?: string
  headers?: Dict<string>
  maxRetryCount?: number
  requestTimeout?: number
  recallTimeout?: number
  maxConcurrency?: number
}

export const Config = Schema.intersect([
  Schema.object({
    type: Schema.union([
      Schema.const('token' as const).description('授权令牌'),
      ...process.env.KOISHI_ENV === 'browser' ? [] : [Schema.const('login' as const).description('账号密码')],
      Schema.const('naifu' as const).description('naifu'),
      Schema.const('sd-webui' as const).description('sd-webui'),
    ] as const).description('登录方式'),
  }).description('登录设置'),

  Schema.union([
    Schema.intersect([
      Schema.union([
        Schema.object({
          type: Schema.const('token'),
          token: Schema.string().description('授权令牌。').role('secret').required(),
        }),
        Schema.object({
          type: Schema.const('login'),
          email: Schema.string().description('账号邮箱。').required(),
          password: Schema.string().description('账号密码。').role('secret').required(),
        }),
      ]),
      Schema.object({
        endpoint: Schema.string().description('API 服务器地址。').default('https://api.novelai.net'),
        headers: Schema.dict(String).description('要附加的额外请求头。').default({
          'referer': 'https://novelai.net/',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
        }),
        allowAnlas: Schema.union([
          Schema.const(true).description('允许'),
          Schema.const(false).description('禁止'),
          Schema.natural().description('权限等级').default(1),
        ]).default(true).description('是否允许使用点数。禁用后部分功能 (图片增强和手动设置某些参数) 将无法使用。'),
      }),
    ]),
    Schema.object({
      type: Schema.const('naifu'),
      token: Schema.string().description('授权令牌。').role('secret'),
      endpoint: Schema.string().description('API 服务器地址。').required(),
      headers: Schema.dict(String).description('要附加的额外请求头。'),
    }),
    Schema.object({
      type: Schema.const('sd-webui'),
      endpoint: Schema.string().description('API 服务器地址。').required(),
      headers: Schema.dict(String).description('要附加的额外请求头。'),
    }),
  ]),

  Schema.union([
    Schema.object({
      type: Schema.const('sd-webui'),
      sampler: sampler.createSchema(sampler.sd),
    }).description('参数设置'),
    Schema.object({
      type: Schema.const('naifu'),
      sampler: sampler.createSchema(sampler.nai),
    }).description('参数设置'),
    Schema.object({
      model: Schema.union(models).description('默认的生成模型。').default('nai'),
      sampler: sampler.createSchema(sampler.nai),
    }).description('参数设置'),
  ] as const),

  Schema.object({
    orient: Schema.union(orients).description('默认的图片方向。').default('portrait'),
    maxSteps: Schema.natural().description('允许的最大迭代步数。').default(0),
    maxResolution: Schema.natural().description('生成图片的最大尺寸。').default(0),
  }),

  Schema.object({
    basePrompt: Schema.string().role('textarea').description('默认附加的标签。').default('masterpiece, best quality'),
    negativePrompt: Schema.string().role('textarea').description('默认附加的反向标签。').default(ucPreset),
    forbidden: Schema.string().role('textarea').description('违禁词列表。含有违禁词的请求将被拒绝。').default(''),
  }).description('输入设置'),

  Schema.object({
    output: Schema.union([
      Schema.const('minimal').description('只发送图片'),
      Schema.const('default').description('发送图片和关键信息'),
      Schema.const('verbose').description('发送全部信息'),
    ]).description('输出方式。').default('default'),
    maxRetryCount: Schema.natural().description('连接失败时最大的重试次数。').default(3),
    requestTimeout: Schema.number().role('time').description('当请求超过这个时间时会中止并提示超时。').default(Time.minute),
    recallTimeout: Schema.number().role('time').description('图片发送后自动撤回的时间 (设置为 0 以禁用此功能)。').default(0),
    maxConcurrency: Schema.number().description('单个频道下的最大并发数量 (设置为 0 以禁用此功能)。').default(0),
  }).description('高级设置'),
]) as Schema<Config>

interface Forbidden {
  pattern: string
  strict: boolean
}

export function parseForbidden(input: string) {
  return input.trim()
    .toLowerCase()
    .replace(/，/g, ',')
    .split(/(?:,\s*|\s*\n\s*)/g)
    .filter(Boolean)
    .map<Forbidden>((pattern: string) => {
      const strict = pattern.endsWith('!')
      if (strict) pattern = pattern.slice(0, -1)
      pattern = pattern.replace(/[^a-z0-9]+/g, ' ').trim()
      return { pattern, strict }
    })
}

const backslash = /@@__BACKSLASH__@@/g

export function parseInput(input: string, config: Config, forbidden: Forbidden[], override: boolean): string[] {
  input = input.toLowerCase()
    .replace(/\\\\/g, backslash.source)
    .replace(/，/g, ',')
    .replace(/（/g, '(')
    .replace(/）/g, ')')

  if (config.type === 'sd-webui') {
    input = input
      .replace(/(^|[^\\])\{/g, (_, $1) => $1 + '(')
      .replace(/(^|[^\\])\}/g, (_, $1) => $1 + ')')
  } else {
    input = input
      .replace(/(^|[^\\])\(/g, (_, $1) => $1 + '{')
      .replace(/(^|[^\\])\)/g, (_, $1) => $1 + '}')
  }

  input = input
    .replace(backslash, '\\')
    .replace(/_/g, ' ')

  if (/[^\s\w"'“”‘’.,:|\\()\[\]{}-]/.test(input)) {
    return ['.invalid-input']
  }

  const negative = []
  const appendToList = (words: string[], input: string) => {
    for (let tag of input.split(/,\s*/g)) {
      tag = tag.trim().toLowerCase()
      if (tag && !words.includes(tag)) words.push(tag)
    }
  }

  // extract negative prompts
  const capture = input.match(/(,\s*|\s+)(-u\s+|negative prompts?:)\s*([\s\S]+)/m)
  if (capture?.[3]) {
    input = input.slice(0, capture.index).trim()
    appendToList(negative, capture[3])
  }

  // remove forbidden words
  const positive = input.split(/,\s*/g).filter((word) => {
    word = word.replace(/[^a-z0-9]+/g, ' ').trim()
    if (!word) return false
    for (const { pattern, strict } of forbidden) {
      if (strict && word.split(/\W+/g).includes(pattern)) {
        return false
      } else if (!strict && word.includes(pattern)) {
        return false
      }
    }
    return true
  })

  if (!override) {
    appendToList(positive, config.basePrompt)
    appendToList(negative, config.negativePrompt)
  }

  return [null, positive.join(', '), negative.join(', ')]
}
