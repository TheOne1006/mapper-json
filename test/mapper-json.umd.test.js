'use strict';

const MapperJson = require("../dist/mapper-json.umd")

/**
 * MapperJson test
 */
describe("MapperJson test with umd", () => {
  it("works if true is truthy", () => {
    expect(true).toBeTruthy()
  })

  it("MapperJson is instantiable", () => {
    expect(new MapperJson()).toBeInstanceOf(MapperJson)
  })

  describe("tranWithRules", () => {
    it("test with rule", () => {
      const source = {
        foo: 'bar',
        t1: 1,
        t2: 't2',
        time: '1572924810163',
        a1: 'a',
        a2: 'b',
        numstr: '12.1',
        str_arr: '1|2|1|3',
        category: 'shehui',
        rightSelect: 3,
        leftSelect: 3,
      };

      const rules = {
        baz: 'foo',
        arr: ['t1', 't2'],
        force: {
          op: 'force',
          value: 'f',
        },
        if: {
          op: 'if',
          value: 'f',
          defaultValue: 'cc'
        },
        date: {
          op: 'moment-format',
          select: 'time',
          sourceFormat: 'x',
          targetFormat: 'YYYY-MM-DD',
        },
        as: {
          op: 'array-select',
          selects: ['a2', 'a1'],
          defaultValues: ['a', 'c'],
        },
        md5: {
          op: 'md5-select',
          select: 'a1',
        },
        num: {
          op: 'str-2-num',
          select: 'numstr'
        },
        str2arr: {
          op: 'split-str-2-arr',
          separator: '|',
          select: 'str_arr',
          itemType: 'number'

        },
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
          {
            op: 'switch',
            options: [
              {
                result: 'neq',
                leftSelect: 'category',
                operation: 'neq',
                rightValue: 'shehui2'
              }
            ]
          },
          {
            op: 'switch',
            options: [
              {
                result: '>=',
                leftValue: 4,
                operation: 'gt',
                rightSelect: 'rightSelect'
              }
            ]
          },
          {
            op: 'switch',
            options: [
              {
                result: '>=',
                leftValue: 4,
                operation: 'egt',
                rightSelect: 'rightSelect'
              }
            ]
          },
          {
            op: 'switch',
            options: [
              {
                result: '<',
                leftValue: 2,
                operation: 'lt',
                rightSelect: 'rightSelect'
              }
            ]
          },
          {
            op: 'switch',
            options: [
              {
                result: '<=',
                leftValue: 3,
                operation: 'elt',
                rightSelect: 'rightSelect'
              }
            ]
          },
          {
            op: 'switch',
            options: [
              {
                result: 'error',
                leftValue: '4',
                operation: 'eq',
                rightSelect: 'rightSelect'
              },
              {
                result: 'true',
                leftValue: 3,
                operation: 'heq',
                rightSelect: 'rightSelect'
              }
            ]
          },
          {
            op: 'switch',
            options: [
              {
                result: 'error',
                leftValue: '4',
                operation: 'eq',
                rightSelect: 'rightSelect'
              },
              {
                result: 'true',
                leftValue: 0,
                operation: 'nheq',
                rightSelect: 'rightSelect'
              }
            ]
          },
          {
            op: 'switch',
            defaultValue: 'default',
            options: [
              {
                result: 'error',
                leftValue: '4',
                operation: 'eq',
                rightSelect: 'rightSelect'
              },
            ]
          },
        ]
      };

      const expected = {
        baz: 'bar',
        arr: [1, 't2'],
        force: 'f',
        if: 'cc',
        date: '2019-11-05',
        as: ['b', 'a'],
        md5: '0cc175b9c0f1b6a831c399e269772661',
        num: 12.1,
        str2arr: [1, 2, 1, 3],
        switch: ['社会', 'neq', '>=', '>=', '<', '<=', 'true', 'true', 'default']
      };

      const actual = MapperJson.tranWithRules(source, rules);

      expect(actual).toEqual(expected);
    })

    it("test with rule2", () => {
      const source = {
        str_arr: '1|type',
        t1: 'foo'
      };

      const rules = {
        arr: {
          op: 'array-select',
          selects: ['t1', 'a1'],
          defaultValues: ['a', 'c'],
        },
        arr2: {
          op: 'array-select',
          selects: ['t12', 'a12'],
          defaultValues: ['a', 'c'],
        },
        str2arr: {
          op: 'split-str-2-arr',
          separator: '|',
          select: 'str_arr',
        },
        str2arr_default: {
          op: 'split-str-2-arr',
          separator: '|',
          select: 'str_arr_other',
          defaultValue: [1]
        },
        str2arr_empty: {
          op: 'split-str-2-arr',
          separator: '|',
          select: 'str_arr_other',
        },
        md5_empty: {
          op: 'md5-select',
          select: 'a1',
        }
      };

      const expected = {
        str2arr: ["1", "type"],
        str2arr_default: [1],
        str2arr_empty: [],
        md5_empty: '',
        arr: ['foo'],
        arr2: ['a', 'c'],
      };

      const actual = MapperJson.tranWithRules(source, rules);

      expect(actual).toEqual(expected);
    })


    it("test with random", () => {
      const source = {

      };

      const rules = {
        foo: {
          op: 'random-num',
          min: 50,
          max: 100,
        }
      };

      const actual = MapperJson.tranWithRules(source, rules);

      expect(actual.foo > 50).toBe(true);
      expect(actual.foo < 100).toBe(true);
    })

  })



  describe("prototype.trans", () => {

    it("with empty rules", () => {
      const rules = {};
      const mapperJson = new MapperJson(rules);
      const source = {
        norule: {
          cc: '1'
        }
      }

      const actual = mapperJson.trans(source);
      const expected = {
        norule: {
          cc: '1'
        }
      }

      expect(actual).toEqual(expected);
    })

    it("with false rule", () => {
      const rules = {
        t: 'norule.cc',
        foo: false,
      };
      const mapperJson = new MapperJson(rules);
      const source = {
        norule: {
          cc: '1'
        }
      }

      const actual = mapperJson.trans(source);
      const expected = { t: '1' }

      expect(actual).toEqual(expected);
    })

  });




})
