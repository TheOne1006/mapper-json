
import _ from 'lodash';
import moment from 'moment';
import crypto from 'crypto';

const RULE_OPTION_TYPE_STRING = 'string'; // 字符串
const RULE_OPTION_TYPE_ARRAY = 'array'; // 数组
const RULE_OPTION_TYPE_MULI = 'muli'; // 扩展

const OP_FORCE = 'force';
const OP_SWITCH = 'switch';
const OP_IF = 'if';
const OP_MOMENT_FORMAT = 'moment-format';
const OP_ARRAY_SELECT = 'array-select';
const OP_MD5_SELECT = 'md5-select';
const OP_RANDOM_NUM = 'random-num';
const OP_STR_2_NUM = 'str-2-num';
const OP_SPLIT_STR_2_ARR = 'split-str-2-arr';



/**
 * 判断是否满足等式
 * @param  {any} lValue    左值
 * @param  {string} operation 操作符号
 * @param  {any} rValue    右值
 * @return {Boolean} 是否满足等式
 */
function operationMatch(lValue: any, operation: string , rValue: any) {
  let result = false;
  switch (operation) {
    case 'gt':
      result = lValue > rValue;
      break;
    case 'egt':
      result = lValue >= rValue;
      break;
    case 'lt':
      result = lValue < rValue;
      break;
    case 'elt':
      result = lValue <= rValue;
      break;
    case 'eq':
      // tslint:disable-next-line: triple-equals
      result = lValue == rValue;
      break;
    case 'neq':
      // tslint:disable-next-line: triple-equals
      result = lValue != rValue;
      break;
    case 'heq':
      result = lValue === rValue;
      break;
    case 'nheq':
      result = lValue !== rValue;
      break;
    default:
      break;
  }

  return result;
}


export default class MapperJson {

  private rules: any = {};

  /**
   *
   * @param rules define rule object
   */
  constructor(rules: object = {}) {
    this.rules = rules;
  }

  static tranWithRules(source: any, rules: object) {
    const mapper = new MapperJson(rules);
    return mapper.trans(source);
  }

  trans(originSource: any): any {
    const that = this;
    const rules = this.rules;
    // 当 rule 为空值时, 不做任何处理
    if (_.isEmpty(rules)) {
      return originSource;
    }

    // 定义空的返回值
    let target = {};

    // 深度复制数据
    const source = _.cloneDeep(originSource);
    const targetKeys = Object.keys(rules);

    // 递归遍历处理rule
    targetKeys.reduce((origin: any, targetKey: string) => {
      // 容错, 如规则值为 false
      if (!rules[targetKey]) {
        return origin;
      }

      // 容错, 避免出现 constructor 属性
      if (!rules.hasOwnProperty(targetKey)) {
        return origin;
      }

      const rule = rules[targetKey];
      origin[targetKey] = that.pickItem(source, rule);

      return origin;

    }, target);


    return target;
  }

  /**
   * 单项从来源中根据规则, 获取相关数据
   * @param source
   * @param ruleItem
   */
  pickItem(source: any, ruleItem: any): any {
    // enums RULE_OPTION_TYPE_STRING / RULE_OPTION_TYPE_ARRAY / RULE_OPTION_TYPE_MULI
    let type = (typeof ruleItem === 'string') ? RULE_OPTION_TYPE_STRING : ( // 字符串
      Array.isArray(ruleItem) ? RULE_OPTION_TYPE_ARRAY : (
        _.isObject(ruleItem) ? RULE_OPTION_TYPE_MULI : ''
      )
    );

    let result: any = null;

    switch (type) {
      case RULE_OPTION_TYPE_STRING:
        result = _.result(source, ruleItem);
        break;
        case RULE_OPTION_TYPE_ARRAY:
        const rules: any = ruleItem;
        // 支持递归
        result = rules.map((item: any) => this.pickItem(source, item));
        break;
        case RULE_OPTION_TYPE_MULI:
        // 支持递归
        result = this.mapMuliParse(source, ruleItem);
        break;

      default:
        break;
    }

    return result;
  }


  /**
   * 单项从来源中根据规则, 获取相关数据
   * @param source
   * @param ruleItem
   */
  mapMuliParse(source: any, options: any): any {
    switch (options.op) {
      // 强制设置
      case OP_FORCE:
        return options.value;
      case OP_SWITCH:
        return this.switchMapTask(source, options);
      case OP_IF:
        return this.ifMapTask(source, options);
      case OP_MOMENT_FORMAT:
        return this.momentFormatTask(source, options);
      case OP_ARRAY_SELECT:
        return this.arraySelectTask(source, options);
      case OP_MD5_SELECT:
        return this.md5SelectTask(source, options);
      case OP_RANDOM_NUM:
        return this.randomNumTask(source, options);
      case OP_STR_2_NUM:
        return this.str2numTask(source, options);
      case OP_SPLIT_STR_2_ARR:
        return this.splitStr2Arr(source, options);
      default:
        break;
    }

    return null;

  }



  /**
   * ==============================================
   * Tasks
   * ==============================================
   */


   /**
    * switch选项解析器
    * @param  {object} source  元数据
    * @param  {object} options 复杂选项 json 表达式
    * @return {any} 任何可能的值
    */
  switchMapTask(source: any, options: any) {
    const selectOptions = options.options;
    const defaultValue = options.default;
    let result;

    if (selectOptions && selectOptions.length) {
      const matchItem = _.find(selectOptions, itemOption => {
        const leftValue = _.result(source, itemOption.leftSelect);
        const rightValue = itemOption.rightValue ? itemOption.rightValue : (
          itemOption.rightSelect ? _.result(source, itemOption.rightSelect) : null
        );
        return operationMatch(leftValue, itemOption.operation, rightValue);
      });

      if (matchItem && matchItem.resultSelect) {
        result = _.result(source, matchItem.resultSelect);
      } else {
        result = matchItem && matchItem.result;
      }
    }

    return typeof result !== 'undefined' ? result : defaultValue;
  }

  /**
   * if 选择器
   * @param source 元数据
   * @param options 复杂选项 json 表达式
   * @return {any} 任何可能的值
   */
  ifMapTask(source: any, options: any) {
    const targetSelect = options.targetSelect;
    const defaultSelect = options.defaultSelect;
    const defaultValue = options.defaultValue;

    const targetResult = _.result(source, targetSelect);
    const defaultResult = _.result(source, defaultSelect) || defaultValue;

    return (!_.isNull(targetResult) && !_.isUndefined(targetResult)) ? targetResult : defaultResult;
  }


  /**
   * moment 格式化
   * @param source 元数据
   * @param options 复杂选项 json 表达式
   * @return {any} 任何可能的值
   *
   * demo
   * {
   *   default: '2017-01-10',
   *   select: 'time',
   *   format: 'YYYY-MM-DD',
   *   sourceFormat: 'X'
   * }
   */
  momentFormatTask(source: any, options: any = {}) {
    let sourceValue = options.sourceValue || undefined;
    const sourceFormat = options.sourceFormat || undefined;
    const select = options.select;
    const targetFormat = options.targetFormat;

    sourceValue = sourceValue || _.result(source, select) || undefined;
    const now = moment(sourceValue, sourceFormat);
    return now.format(targetFormat);
  }

  /**
   * 将选择的数据转换成数组
   */
  arraySelectTask(source: any, options: any = {}) {
    const selects = options.selects;
    let targetValues = options.defaultValues;
    targetValues = _.isArray(targetValues) ? targetValues : [];

    const selectsLen = selects.length;
    const selectValues = [];

    for (let index = 0; index < selectsLen; index++) {
      const selectPath = selects[index];
      const result = _.result(source, selectPath);

      if (!_.isNull(result) && !_.isUndefined(result)) {
        selectValues.push(result);
      }
    }

    return selectValues.length ? selectValues : targetValues;
  }

  /**
   * 将选择的数据转换成数组
   */
  md5SelectTask(source: any, options: any = {}) {
    const selectPath = options.select;

    const result = _.result(source, selectPath);

    if (result && typeof result === 'string') {
      const md5 = crypto.createHash('md5');
      return md5.update(result).digest('hex');
    }

    return '';
  }


  // 随机数生成
  randomNumTask(source: any, options: any = {}) {
    const min = options.min;
    const max = options.max;

    const diff = max - min;
    const random = Math.floor(Math.random() * diff);

    return min + random;
  }

  str2numTask(source: any, options: any = {}) {
    const select = options.select;
    const defaultValue = options.defaultValue || 0;
    let value = 0;

    if (select) {
      value = _.toNumber(_.result(source, select)) - 0;
    } else {
      value = defaultValue;
    }

    return value;
  }


  splitStr2Arr(source: any, options: any = {}) {
    const separator = options.separator;
    const select = options.select;
    const itemType = options.itemType;
    const defaultValue = options.defaultValue || 0;

    const selectValue: string = _.result(source, select);

    if (!selectValue) {
      return defaultValue;
    }

    let valueArr: any = selectValue.split(separator);

    if (itemType === 'number') {
      valueArr = _.map(valueArr, item => _.toNumber(item));
    }

    return valueArr || defaultValue;
  }

}
