import SimpleTime from './SimpleTime';
import Cron from './Cron-es6';


export function getCronExpression(onceTime, cron, startTime, cycle, hourFlag, minuteFlag, interValDay, endTime, hourInterval, minuteInterval, weekArray, MonthArray, day) {
  let cronExpression = "";
  if (cycle == "1") {
    cronExpression = getCronByStartTime(onceTime);
  } else if (cycle == "5") {
    cronExpression = getCronBySelf(cron);
  } else {
    cronExpression = getCronByTimePoint(startTime, cycle, hourFlag, minuteFlag, interValDay, endTime, hourInterval, minuteInterval, weekArray, MonthArray, day);
  }
  return cronExpression;
}

//onlyOne
function getCronByStartTime (startTime) {
  const _startTime = new SimpleTime(startTime);
  let cron = "";
  cron = new Cron(_startTime);
  return cron.toCron();
}

//selfDef
function getCronBySelf (cron) {
  if (cron == null || cron == "") {
    return;
  }
  return cron;
}

//getCronByTimePoint
function getCronByTimePoint (timePoint, planType, hourFlag, minuteFlag, interValDay, endTime, hourInt, minuteInt, weekDayArr, selectMonth, day) {
  endTime = endTime || timePoint;
  let cron = "";
  if (planType == "2") {
    cron = createCronByTimePoint(timePoint, hourFlag, minuteFlag, endTime, hourInt, minuteInt);
    cron.set('day', 'setBase', '*');
    cron.set('day', 'inc', interValDay + "");
  } else if (planType == "3") {

    let selectedDays = Cron.pack(weekDayArr);
    if (selectedDays == "") {
      selectedDays = "1-7";
    }
    cron = createCronByTimePoint(timePoint, hourFlag, minuteFlag, endTime, hourInt, minuteInt);
    cron.set('weekDay', 'manual', selectedDays);
  } else if (planType == "4") {
    cron = createCronByTimePoint(timePoint, hourFlag, minuteFlag, endTime, hourInt, minuteInt);
    cron.set('month', 'manual', selectMonth);
    day == "-1" ? cron.set('day', 'last', 1) : cron.set('day',
      'manual', day);
  }
  return cron.toCron();
}

function createCronByTimePoint (timePoint, hourFlag, minuteFlag, endTime, hourInt, minuteInt) {
  const cron = new Cron(timePoint);
  if (endTime) {
    const timeAry = endTime.split(":");
    if (timeAry[0].charAt(0) == "0") {
      timeAry[0] = timeAry[0].charAt(1);
    }
    cron.set('hour', 'setBase', timePoint.split(":")[0].replace(/^0/g,
      "")
      + "-" + timeAry[0]);
  }
  if (minuteFlag) {
    cron.set('minute', 'inc', minuteInt);
  } else if (hourFlag) {
    cron.set('hour', 'inc', hourInt);
  }
  return cron;
}


