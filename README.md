# Mapper-JSON

将一个json 通过 规则定义，生产两一个 json

## 使用方式

```javascript
import MapperJson from 'mapper-json'

// 数据
const source = {
  foo: 'bar',
  t1: 1,
  t2: 't2',
  numstr: '12.1',
  str_arr: '1|2|1|3',
  category: 'shehui',
};

// 规则
const rules = {
  baz: 'foo',
  arr: ['t1', 't2'],
  switch: [
    {
      op: 'switch',
      options: [
        {
          result: '社会',
          leftSelect: 'category',
          operation: 'eq',
          rightValue: 'shehui'
        }
      ]
    },
  ],
}

// 转换
const result = MapperJson.tranWithRules(source, rules);

// or
const mapperJsonInstance = new MapperJson(rules);
const result = mapperJsonInstance.trans(source);

// const result = {
//   baz: 'bar',
//   arr: [1, 't2'],
//   switch: ['社会']
// };


```
