const numericValueSchema = z.union([z.number(), z.string(), z.boolean(), z.null()]).transform(value => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  if (value == null) {
    return 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
});

const dynamicNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(dynamicNodeSchema),
    z.record(z.string(), dynamicNodeSchema),
  ]),
);

const namedDescriptionSchema = z.object({
  名称: z.string(),
  品阶: z.string(),
  描述: z.string(),
});

const recordCountSchema = z.record(z.string(), dynamicNodeSchema).transform(record => {
  const nonEmptyEntries = Object.entries(record).filter(([, value]) => {
    if (value == null) {
      return false;
    }
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return Object.keys(value).length > 0;
  });
  return Object.fromEntries(nonEmptyEntries);
});

export const Schema = z.object({
  世界定位: z.object({
    当前大域: z.string(),
    当前区域: z.string(),
    当前场景: z.string(),
    场景类型: z.string(),
    当前事件: z.string(),
    日期: z.string(),
    天气: z.string(),
  }),
  在场人物: z.record(z.string(), dynamicNodeSchema),
  用户信息: z.object({
    姓名: z.string(),
    性别: z.string(),
    年龄: numericValueSchema,
    灵根: z.string(),
    体质: z.string(),
    称号: z.string(),
    修真百艺: z.array(z.string()),
    修为境界: z.string(),
    修炼进度: numericValueSchema.transform(value => _.clamp(value, 0, 100)),
    所属势力: z.string(),
    当前状态: z.string(),
    剑心境界: z.string(),
    丹道境界: z.string(),
    宗门贡献: numericValueSchema,
    背包: z.object({
      灵石: z.object({
        下品: numericValueSchema,
        中品: numericValueSchema,
        上品: numericValueSchema,
      }),
      丹药: recordCountSchema,
      材料: recordCountSchema,
      杂物: recordCountSchema,
    }),
    功法: z.object({
      主修功法: z.object({
        名称: z.string(),
        品阶: z.string(),
        总层数: numericValueSchema,
        当前层数: numericValueSchema,
        描述: z.string(),
      }),
      辅修功法: recordCountSchema,
      术法: recordCountSchema,
    }),
    法宝: z.object({
      本命法宝: namedDescriptionSchema,
      防御法宝: namedDescriptionSchema,
      辅助法宝: recordCountSchema,
      未装备法宝: recordCountSchema,
    }),
    灵兽: recordCountSchema,
  }),
  男性好感度: z.record(z.string(), dynamicNodeSchema),
  女性好感度: z.record(z.string(), dynamicNodeSchema),
  剧情标记: z.record(z.string(), dynamicNodeSchema),
});

export type Schema = z.output<typeof Schema>;
