var __$ = {
  create: function () {
    return function () {
      this.initialize.apply(this, arguments);
    }
  },
  extend: function (destination, source) {
    for (var property in source) {
      destination[property] = source[property];
    }
    return destination;
  }
};

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
var SimpleTime = __$.create();
__$.extend(SimpleTime.prototype, {
  initialize: function (time) {
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
  },
  getYear: function () {
    return this.timeAry[0] ? this.timeAry[0].replace(/^0/g, "") : this.timeAry[0];
  },
  getMonth: function () {
    return this.timeAry[1] ? this.timeAry[1].replace(/^0/g, "") : this.timeAry[1];
  },
  getDay: function () {
    return this.timeAry[2] ? this.timeAry[2].replace(/^0/g, "") : this.timeAry[2];
  },
  getHour: function () {
    return this.timeAry[3] ? this.timeAry[3].replace(/^0/g, "") : this.timeAry[3];
  },
  getMinute: function () {
    return this.timeAry[4] ? this.timeAry[4].replace(/^0/g, "") : this.timeAry[4]
  },
  getSecond: function () {
    return this.timeAry[5] ? this.timeAry[5].replace(/^0/g, "") : this.timeAry[5];
  }
}
);

/*
 * Cron表达式中内建的域对象，封装了域的操作方法
 * 初始化时通过type初始化类型，对应的操作域操作方法如下:
 * 	setBase:接受一个参数，用于设置域基值
 * 	inc:增量，接受一个参数incr,每隔incr时间
 * 	any:任意时刻，即*
 * 	manual:接受参数str,手动输入，用于输入比较复杂的域值str
 * 	ask:问号，日域或星期域有一个必然是?
 * 	last:将当前域设置成按倒数，如果输入参数则为倒数第几天，如果不输入参数，按setBase的值计算
 * 	nolast:删除last属性
 * 	workDay:日域是否为工作日，如果输入参数则为第几个工作日，如果不输入参数，按setBase的值计算
 *  noWorkDay:删除工作日属性
 *  selectWeek:第几周的周几，接受两个参数，week代表第几周，weekDay代表星期几
 *  toDomainStr:返回此域的Cron表达式域字符串
 */
var _Domain = __$.create();
__$.extend(_Domain.prototype, {
  initialize: function (arg, type) {
    this.type = type;
    this.base = arg || "0";
    if (type == 'weekDay' || type == 'day' || type == 'month') {
      this.base = this.base == "0" ? 1 : this.base;
    }
    if (!arg) {
      this.anyType = true;
      return;
    }
  },
  setBase: function (baseStr) {
    this.base = baseStr;
  },
  inc: function (incr) {
    delete this.anyType;
    delete this.askType;
    delete this.manualType;
    this.incStep = incr;
  },
  any: function () {
    delete this.incStep;
    delete this.askType;
    delete this.manualType;
    this.anyType = true;
  },
  manual: function (str) {
    delete this.incStep;
    delete this.anyType;
    delete this.askType;
    this.manualType = true;
    this.manualStr = str;
  },
  ask: function () {
    delete this.anyType;
    delete this.incStep;
    delete this.manualType;
    this.askType = true;
  },
  last: function (num) {
    delete this.askType;
    delete this.anyType;
    if (typeof num != "undefined") {
      this.base = num + "";
    }
    var newBase = (this.base.match(/[\d]+/) || [this.base][0]) + "L";
    this.base = newBase == "1L" ? "L" : newBase;
  },
  nolast: function () {
    this.base = this.base.replace(/L$/, "");
  },
  workDay: function (num) {
    delete this.askType;
    delete this.anyType;
    if (typeof num != "undefined") {
      this.base = num + "";
    }
    this.base = (this.base.match(/[\d]+/) || [this.base][0]) + "W";
  },
  noworkDay: function () {
    this.base = this.base.replace(/W$/, "");
  },
  selectWeek: function (week, weekDay) {
    this.manual(week + "#" + weekDay);
  },
  toDomainStr: function () {
    if (this.anyType) {
      return "*";
    }
    if (this.incStep) {
      return this.base + "/" + this.incStep;
    }
    if (this.manualType) {
      return this.manualStr;
    }
    if (this.askType) {
      return "?";
    }
    return this.base;
  }
}
)

/*
 * Cron表达式类对象
 * 初始化时入参为时间字符串形如
 * 	1.yyyy-mm-dd hh:MM:ss
 * 	2.yyyy-mm-dd
 * 	3.hh:MM:ss
 * 内建7个域:year,weekDay,month,day,hour,minute,second
 * 	可以通过Cron的实例对象.domain[域].方法(参数)访问指定域的指定方法
 *	可以通过内建的set方法访问
 * 内建方法:
 * 	set:可以通过Cron的实例对象.set('域','方法',参数1,[...,参数n])访问指定域的指定方法
 * 	toCron:返回当前Cron表达式对象的Cron表达式串
 * 注意:
 * 	1.日期输入需要校验格式，内部没有校验格式
 * 	2.weekDay域中，初始化后为?
 * 	3.设置day域时，weekDay域会自动转换为?，反之亦然
 * 	4.具体域方法见_Domain类的内建方法
 */
var Cron = __$.create();

Cron.pack = function (input) {
  var lines = [];
  var line = [input[0]];
  for (var i = 1; i < input.length; i++) {
    if (line.length == 0 || input[i] - 1 == line[line.length - 1]) {
      line.push(input[i]);
    } else {
      lines.push(line);
      line = [input[i]];
    }
  }
  lines.push(line);
  for (var i = 0; i < lines.length; i++) {
    lines[i] = lines[i].length > 2 ? lines[i].shift() + "-" + lines[i].pop() : lines[i].join(",");
  }
  return lines.join(",");
}

__$.extend(Cron.prototype, {
  initialize: function (baseTime) {
    this.time = new SimpleTime(baseTime);
    this.domain = {
      hour: new _Domain(this.time.getHour(), "hour"),
      minute: new _Domain(this.time.getMinute(), "minute"),
      second: new _Domain(this.time.getSecond(), "second"),
      day: new _Domain(this.time.getDay(), "day"),
      month: new _Domain(this.time.getMonth(), "month"),
      weekDay: new _Domain(null, "weekDay"),
      year: new _Domain(this.time.getYear(), "year")
    }
    this.domain.weekDay.ask();
  },
  toCron: function () {
    var domainAry = [];
    domainAry.push(format(this.domain['second'].toDomainStr()));
    domainAry.push(format(this.domain['minute'].toDomainStr()));
    domainAry.push(format(this.domain['hour'].toDomainStr()));
    domainAry.push(format(this.domain['day'].toDomainStr()));
    domainAry.push(format(this.domain['month'].toDomainStr()));
    domainAry.push(this.domain['weekDay'].toDomainStr());
    domainAry.push(this.domain['year'].toDomainStr());
    return domainAry.join(" ");
  },
  set: function (domain, operationType) {
    if (domain == "weekDay" && (operationType != "ask")) {
      this.domain['day']["ask"]();
    } else if (domain == "day" && (operationType != "ask")) {
      this.domain['weekDay']["ask"]();
    }
    var args = [];
    for (var i = 2; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    this.domain[domain][operationType].apply(this.domain[domain], args);
  }
}
)

function format (val) {
  if (val < 10) {
    return "0" + val
  }
  return val
}

