/*
 * 创建SimpleTime类，用于对3种格式的时间进行处理
 * 初始化时入参为时间字符串形如
 * 	1.yyyy-mm-dd hh:MM:ss
 * 	2.yyyy-mm-dd
 * 	3.hh:MM:ss
 * 内建6个字段:year,month,day,hour,minute,second
 * 内建6个字段的get方法，符合java命名规范
 * 注意:
 * 	1.日期输入需要校验格式，内部没有校验格式
 * 	2.初始化串形如yyyy-mm-dd和hh:MM:ss时，get没有值的域会返回undefined
 */
export default class SimpleTime {
  constructor(time) {
    time = time || "";
    switch (time.length) {
      case 8:
        this.timeAry = ['', '', ''].concat(time.split(":"));
        break;
      case 10:
        this.timeAry = time.split("-").concat(['', '', '']);
        break;
      case 19:
        this.timeAry = time.split(/[:| |-]/g);
        break;
      default:
        this.timeAry = [];
    }
  }
  getYear() {
    return this.timeAry[0] ? this.timeAry[0].replace(/^0/g, "") : this.timeAry[0];
  }
  getMonth() {
    return this.timeAry[1] ? this.timeAry[1].replace(/^0/g, "") : this.timeAry[1];
  }
  getDay() {
    return this.timeAry[2] ? this.timeAry[0].replace(/^0/g, "") : this.timeAry[0];
  }
  getHour() {
    return this.timeAry[3] ? this.timeAry[0].replace(/^0/g, "") : this.timeAry[0];
  }
  getMinute() {
    return this.timeAry[4] ? this.timeAry[0].replace(/^0/g, "") : this.timeAry[0];
  }
  getSecond() {
    return this.timeAry[5] ? this.timeAry[0].replace(/^0/g, "") : this.timeAry[0];
  }
}