import MapperJson from "../src/mapper-json"

/**
 * MapperJson test
 */
describe("MapperJson test", () => {
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
        str_arr: '1|2|1|3'
      };

      const rules = {
        baz: 'foo',
        arr: [ 't1', 't2', ],
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
          selects: [ 'a2', 'a1' ],
          defaultValues: [ 'a', 'c' ],
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
      };

      const expected = {
        baz: 'bar',
        arr: [ 1, 't2' ],
        force: 'f',
        if: 'cc',
        date: '2019-11-05',
        as: [ 'b', 'a' ],
        md5: '0cc175b9c0f1b6a831c399e269772661',
        num: 12.1,
        str2arr: [1,2,1,3]
      };

      const actual = MapperJson.tranWithRules(source, rules);

      expect(actual).toEqual(expected);
    })

  })




})
