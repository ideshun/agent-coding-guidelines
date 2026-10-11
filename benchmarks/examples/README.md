# 离线样例的含义

`offline-oracle.json` 来自维护者在隔离临时副本上执行的排序 oracle 检查：错误起点失败，参考修复通过；测试实际检查同分姓名顺序、输入不变、空数组与单元素。

这是记录格式和行为断言的样例。没有调用模型，`model`、模型任务完成、tokens、模型工具调用、模型耗时、确认次数与模型规则违反情况均未测量，因此为 `null`。`group: none` 只是展示记录格式，不能当作模型基线。

当前验证命令：

```sh
node --test tests/benchmark.test.mjs
node benchmarks/collect.mjs validate benchmarks/examples/offline-oracle.json
```

对这个单一离线样例运行 `compare` 会返回 `blocked` 并以 1 退出，这是预期行为。

```sh
node benchmarks/collect.mjs compare benchmarks/examples/offline-oracle.json
```

仓库中测试生成的 `synthetic-test-model` 记录只用于检查对照门槛，不会保存为效果数据。它们不能证明任何真实模型的完成率或效率。
