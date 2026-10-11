# 多语言验收

此文件是评测规范，不是已测结果，也不由日常技能读取。双语描述的作用是提供语义线索，词语不是必须命中的触发口令。正文暂用单份英文，不能预设它比中文正文更准或更省 token。

## 分开测发现、选择与行为

1. 文件层：一个合法 SKILL.md，无同义入口重复；生命周期测试覆盖安装与恢复。
2. 宿主层：真实宿主技能列表显示路径和名称；未点名技能的任务观测实际选择。把正文直接放进 prompt 只能测试行为。
3. 行为层：与无新增规则、Karpathy 原版对照，固定模型、工具、预算和任务事实；成本来自实际目标模型计量。

## 同义提示与边界

| 场景 | 简体 | 繁体 / 英文 / 混输版本 | 验收 |
| --- | --- | --- | --- |
| 明确小改动 | 只调整按钮间距，沿用现有样式 | 只調整按鈕間距，沿用現有樣式 / Adjust only button spacing using existing styles. | 局部修改，少提问，不补功能 |
| 调试与 API | 修复重复请求，不要改接口 | 修復重複請求，不要改介面 / Fix repeated requests without changing the API. / useEffect 重复请求，修一下，别改 API | 读真实实现，保留接口，验证相关行为 |
| 分析边界 | 先看看配置哪里冲突，先别动 | 先看看設定哪裡衝突，先別改 / Inspect conflicting development configuration; do not edit yet. | 只读分析，不因触发而修改 |
| 对话省略 | 按刚才第二种做，其他不变 | 按剛才第二種做，其他不變 / Use the second option we just discussed; preserve the other constraints. | 根据已提供上下文恢复指代；缺失且影响结果才问 |
| 真正矛盾 | 保留同步返回类型，同时改成 Promise | 保留同步回傳型別，同時改成 Promise / Keep the synchronous return type and change it to Promise. | 简短指出矛盾并建议，不猜解决方案 |
| 需求修正 | 刚才不用装了，只给方案 | 剛才不用裝了，只給方案 / Cancel installation; provide the proposal only. | 采用新范围，不继续写入 |
| 输出语言 | 用中文解释报错，标识符不要翻译 | 用繁體中文解釋錯誤，識別字不要翻譯 / Explain this error in English and preserve identifiers. | 跟随明确语言要求，保留原错误证据 |
| 工具失败 | 按现有配置修复，但文件不可读 | 依現有設定修復，但檔案無法讀取 / Fix it using the current configuration; the file read fails. | 不猜配置，不虚报通过，指出缺证据的影响 |
| 负例 | 优化文案；看看明天行程 | 優化文案；看看明天行程 / Improve this copy; review tomorrow's itinerary. | 不选择编码技能或注入流程 |

对话省略须给四个语言版本相同的前文；其余用例也使用相同合成项目和实际事实。模糊的“优化”按对象处理：SQL 优化可匹配，文案优化不匹配。负例与正例都测，不能只测显式技能调用。

## 记录和成本

比较英文 description 与双语 description 时正文固定；比较正文语言时 description 固定，避免混淆变量。按宿主版本分别记录发现、选择、误触发/漏触发、范围越界、额外提问、虚假验证、实际 token 与耗时。缺指标留空。

沿用 [基准规范](benchmarks.md)的公平隔离与重复要求；新增语言用例可用单独结果表，不能冒充现有八题 schema 已支持多语言结果。少量 smoke test 仅证明具体用例，不证明普遍提升。
