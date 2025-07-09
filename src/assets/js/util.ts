import { AnyObject, DownloadFileOption } from "@/types";

/**
 * 将数组中有子项的对象转换成一维数组
 * @param arr 需要转换的数组
 * @param field 子项的field
 * @returns 扁平化之后的数组
 */
export function convertOneArr(arr: Array<any>, field: string): Array<any> {
  let list: any = [];
  function conver(_list: any) {
    _list.forEach((obj: any) => {
      const item = { ...obj };
      if (item[field]) conver(item[field]);
      list.push(item);
    });
  }
  conver(arr);
  return list;
}
/**
 * 将对象中嵌套的对象都解构出来生成新的对象
 * @param obj 需要解构的对象f
 * @returns 扁平化之后的对象
 */
export function convertOneObj(obj: object) {
  let _object: AnyObject = {};
  function converObj(o: any) {
    if (!o || typeof o !== "object" || Object.keys(o).length === 0) return;
    Object.keys(o).forEach((_o) => {
      if (o[_o] && typeof o[_o] === "object" && Object.keys(o[_o]).length > 0) {
        converObj(o[_o]);
      } else {
        _object[_o] = o[_o];
      }
    });
  }
  converObj(obj);
  return _object;
}

/**
 * @description 生成base64编码
 */
export function handleBase64() {
  // private property
  var _keyStr =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

  // public method for encoding
  var encode = function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    input = _utf8_encode(input);
    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output =
        output +
        _keyStr.charAt(enc1) +
        _keyStr.charAt(enc2) +
        _keyStr.charAt(enc3) +
        _keyStr.charAt(enc4);
    }
    return output;
  };

  // public method for decoding
  var decode = function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
      enc1 = _keyStr.indexOf(input.charAt(i++));
      enc2 = _keyStr.indexOf(input.charAt(i++));
      enc3 = _keyStr.indexOf(input.charAt(i++));
      enc4 = _keyStr.indexOf(input.charAt(i++));
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      output = output + String.fromCharCode(chr1);
      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }
    }
    output = _utf8_decode(output);
    return output;
  };

  // private method for UTF-8 encoding
  var _utf8_encode = function (string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  };

  // private method for UTF-8 decoding
  var _utf8_decode = function (utftext) {
    var string = "";
    var i = 0;
    var c = (c1 = c2 = 0);
    while (i < utftext.length) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if (c > 191 && c < 224) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(
          ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
        );
        i += 3;
      }
    }
    return string;
  };
  return {
    encode,
    decode,
  };
}

// 判断是否为数值类型
export function isNumber(value) {
  var patrn = /^(-)?\d+(\.\d+)?$/;
  if (patrn.exec(value) == null || value === "") {
    return false;
  } else {
    return true;
  }
}

/**
 * @description: 将字符串转换为数字
 * @param {string} str
 */
export function convertStringToNumber(str: string): number {
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * @description 将数字转化成日期类型（如：formatDate（“44542”，“-”）= 2021-12-12 ）
 * @param {Number} numb 需要转换的数字
 * @param {String} format 连接符号
 */
/**
 * 日期格式转换
 * `第一个参数为传入的以毫秒为单位的时间戳，第二个参数为格式，具体说明见代码;
 * 不传参则返回当前日期，则为“'yyyy年MM月dd日'”格式显示.`
 * @param {object} _date 日期
 * @param {string} _format 转换后的日期格式
 */

export function formatDate(_date, format: TimeFormat = "YYYY-MM-DD") {
  if (!_date) {
    return "";
  }
  var date = _date || new Date();
  date = new Date(_date);
  var map = {
    M: date.getMonth() + 1, // 月份
    m: date.getMinutes(), // 分
    d: date.getDate(), // 日
    D: date.getDate(), // 日
    h: date.getHours(), // 小时
    H: date.getHours(), // 小时
    s: date.getSeconds(), // 秒
    S: date.getSeconds(), // 秒
    q: Math.floor((date.getMonth() + 3) / 3), // 季度
  };
  let dateString = format.replace(/([yYmDdhHMsSq])+/g, function (all, t) {
    var v = map[t];
    if (v !== undefined) {
      if (all.length > 1) {
        v = "0" + v;
        v = v.substr(v.length - 2);
      }
      return v;
    } else if (t === "y" || t === "Y") {
      return (date.getFullYear() + "").substr(4 - all.length);
    }
    return all;
  });
  return dateString;
}
/**
 * @description: 判断字符串是否是有效日期类型
 * @param {*} date
 */
export function isValidDate(date: string) {
  let bool = false;
  try {
    if (date && !isNaN(new Date(date).getTime())) {
      bool = true;
    }
  } catch (error) {
    bool = false;
  }
  return bool;
}

/**
 * @description 将值和单位进行拼接重新生成字符串
 * @param {any} 值
 * @param {String} 单位
 */
export function joinUnit(value, unit) {
  if (!unit) return value;
  if (value && unit) return `${value} ${unit}`;
  else return "";
}

/** 数组**/
/** 数组根据数组对象中的某个属性值进行排序的方法
 * 使用例子：newArray.sort(sortBy('number',false)) //表示根据number属性降序排列;若第二个参数不传递，默认表示升序排序
 * @param attr 排序的属性 如number属性
 * @param rev true表示升序排列，false降序排序
 * */
export function sortBy(attr, rev = 1) {
  // 第二个参数没有传递 默认升序排列
  if (rev == undefined) {
    rev = 1;
  } else {
    rev = rev ? 1 : -1;
  }

  return function (a, b) {
    a = a[attr];
    b = b[attr];
    if (a < b) {
      return rev * -1;
    }
    if (a > b) {
      return rev * 1;
    }
    return 0;
  };
}

const formatNumber = (n) => {
  n = n.toString();
  return n[1] ? n : "0" + n;
};

/**
 * @description 获取月份之后的日期
 * @param {String} date 日期字符串 如：2021-12-29
 * @param {monthNum} monthNum  月份数
 */
export const getMonthAfterDate = function (date, monthNum) {
  if (date === "") {
    return "";
  } else {
    var dateArr = date.split("-");
    var year = dateArr[0]; // 获取当前日期的年份
    var month = dateArr[1]; // 获取当前日期的月份
    var day = dateArr[2]; // 获取当前日期的日

    var year2 = year; // 新的年
    var month2 = parseInt(month) + parseInt(monthNum); // 新的月
    // 处理月
    if (month2 > 12) {
      year2 =
        parseInt(year2) +
        parseInt(
          parseInt(month2) % 12 === 0
            ? parseInt(month2) / 12 - 1
            : parseInt(month2) / 12
        );
      month2 = parseInt(month2) % 12;
      if (month2 === 0) {
        month2 = 12;
      }
    }
    var day2 = day - 1; // 新的日
    if (day2 === 0) {
      month2 = month2 - 1;
      if (month2 === 0) {
        month2 = 12;
        year2 = year2 - 1;
      } else if (month2 < 10) {
        month2 = "0" + month2;
      }
      var d = new Date(year2, month2, 0);
      day2 = d.getDate();
    } else {
      if (month2 === 0) {
        month2 = 12;
        year2 = year2 - 1;
      } else if (month2 < 10) {
        month2 = "0" + month2;
      }
      if (day2 < 10) {
        day2 = "0" + day2;
      }
    }
    var t2 = year2 + "-" + month2 + "-" + day2;
    return t2;
  }
};

/**
 * @description 合并对象，空值不予替换
 * @param {object} obj1 对象1
 * @param {object} obj2 对象2
 */
export const assignInWith = function (obj1, obj2) {
  if (!obj1 || !obj2 || typeof obj1 !== "object" || typeof obj2 !== "object") {
    console.error("传入值不正确！");
    return {};
  }
  Object.keys(obj1).forEach((e) => {
    obj1[e] = obj2[e] || obj1[e];
  });
  return obj1;
};

/**
 * 简单比较对象的值是否相等
 * @param x {Object} 对象1
 * @param y {Object} 对象2
 * @return  {Boolean} true 为相等，false 为不等
 */
export const deepEqual = (x: any, y: any) => {
  // 指向同一内存时
  if (x === y) {
    return true;
  } else if (
    typeof x == "object" &&
    x != null &&
    typeof y == "object" &&
    y != null
  ) {
    if (Object.keys(x).length !== Object.keys(y).length) {
      return false;
    }
    for (var prop in x) {
      if (y.hasOwnProperty(prop)) {
        if (!deepEqual(x[prop], y[prop])) return false;
      } else {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
};

/**
 * 读取文件转化成数据
 * @param file
 */
export const readFile = (file) => {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (ev) => {
      resolve(ev.target.result);
    };
  });
};

/**
 * @description 转换成日期类型 1.当字符串为空时   2.当为数字时，如44524  3.当格式不一致转换格式
 */
export const convertDate = (str: string) => {
  if (!str) return "";
  if (isNumber(str)) {
    return formatDate(str);
  } else {
    return str.replace(/ |-|\.|,|。/g, "/");
  }
};

/**
 * @param  array 传入的原始数组，
 *  @param keyMap 需要改变的键值映射 {id:'workCategoryId',name:'workCategoryName'} ,id需要改为workCategoryId
 * @returns 返回键值改变后的数组
 *
 */

export const updateArrayKey = (array: any, keyMap: any) => {
  for (let item of array) {
    for (let key in item) {
      let newKey = keyMap[key];
      if (newKey) {
        item[newKey] = item[key];
        delete item[key];
      }
    }
  }
};

/*数据分析中结论判断 */

export const rawHtml = (value: number) => {
  let str;
  switch (value) {
    case 0:
      str = "<span>未判定</span> ";
      break;
    case 1:
      str = '<span style="color:#008000;font-size:16px">I类</span>';
      break;
    case 2:
      str = '<span style="color:#008000;font-size:16px">II类</span>';
      break;
    case 3:
      str = '<span style="color:#FF0000;font-size:16px">III类</span>';
      break;
    case 4:
      str = '<span style="color:#FF0000;font-size:16px">IV类</span>';
      break;
    case 5:
      str = '<span style="color:green;font-size:16px">合格</span>';
      break;
    case 6:
      str = '<span style="color:red;font-size:16px">不合格</span>';
      break;
    case 7:
      str = '<span style="color:#000;font-size:16px">结论不明</span>';
      break;
  }
  return str;
};

/**
 * @description 获取文件的base64字符串
 * @param {object} file 当前上传的文件对象
 */
export const getBase64 = (file: any): Promise<string> => {
  return new Promise(function (resolve, reject) {
    let reader = new FileReader();
    let imgResult = "";
    reader.readAsDataURL(file);
    reader.onload = function (e: any) {
      imgResult = e.target.result;
    };
    reader.onerror = function (error) {
      reject(error);
    };
    reader.onloadend = function () {
      resolve(imgResult);
    };
  });
};

/**
 * @description:判断对象是否为空对象
 * @param {object} obj 需要判断的对象
 */
export const isEmptyObj = (obj: object): boolean => {
  return (
    typeof obj === "object" &&
    obj != null &&
    obj != undefined &&
    Object.keys(obj).length === 0
  );
};
/**
 * @description: 懒加载
 * @param {object} option {loadDoms : 懒加载的元素集合，root：根元素}
 * @param {Function} callback
 */
export const lazyLoad = (
  option: {
    loadDoms: Array<Element>;
    root?: Document | undefined | null | Element;
  },
  callback: Function
) => {
  const fun = async (entries: any) => {
    for (let entry of entries) {
      if (entry.isIntersecting) {
        callback(entry.target);
        observer.unobserve(entry.target);
      }
    }
  };
  const observer = new IntersectionObserver(fun, {
    root: option.root,
  });
  // 批量监听
  option.loadDoms.forEach((item) => {
    observer.observe(item);
  });
};
/**
 * @description: 首字母转换成大写或者小写
 * @param {string} str 要转换的字符串
 * @param {number} str 要转换的是大写1还是小写0
 */
export const initialConver = (str: string, mode = 0 as 0 | 1): string => {
  if (!str || typeof str !== "string") return "";
  if (mode === 0) return str.charAt(0).toLowerCase() + str.slice(1);
  if (mode === 1) return str.charAt(0).toUpperCase() + str.slice(1);
  return "";
};

/**
 * @description: 保留小数，默认两位
 * @param {string} str 字符串或者数字
 * @param {*} place 默认两位
 */
export const toFixedX = (str: string | number, place = 2) => {
  if (typeof str !== "number" && typeof str !== "string")
    return parseFloat("0").toFixed(place);
  return parseFloat(str).toFixed(place);
};

/**
 * @description: 判断bolb对象是否是图片类型
 * @param {Blob} blob
 */
export const blobIsImage = (blob: Blob) => {
  return blob.type.indexOf("image") !== -1;
};
/**
 * @description: 判断bolb对象是否是图片类型
 * @param {Blob} blob
 */
export const blobIsPdf = (blob: Blob) => {
  return blob.type.indexOf("pdf") !== -1;
};

/**
 * @description: blob二进制转化成base64
 * @param {Blob} blob blob文件流
 * @param {Function} callback 返回的
 */
export const blobToDataURI = (blob: Blob, callback: Function) => {
  var reader = new FileReader();
  reader.onload = function (e) {
    callback(e.target.result);
  };
  reader.readAsDataURL(blob);
};
export const fileToBlob = (file: File) => {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.addEventListener("load", (e) => {
      let base64 = e.target.result;
      let blob = new Blob([base64], { type: file.type });
      resolve(blob);
    });
    reader.readAsDataURL(file);
  });
};
/**
 * @description: 下载文件流
 * @param {Blob} flie blob文件流
 * @param {DownloadFileOption} option 下载的配置
 */
export const downloadFile = (flie: Blob, option: DownloadFileOption) => {
  let link = document.createElement("a");
  link.style.display = "none";
  let objectUrl = URL.createObjectURL(flie);
  link.setAttribute("href", objectUrl);
  link.setAttribute("download", `${option.fileName}.${option.fileType}`);
  link.click();
  // 释放内存
  window.URL.revokeObjectURL(link.href);
};

/**
 * @description: arrayBuffer转化成字符串
 * @param {*} buffer
 * @param {*} encoding
 */
export function arrayBufferToString(buffer, encoding = "utf-8") {
  const decoder = new TextDecoder(encoding);
  return decoder.decode(buffer);
}

/**
 * @description: 判断字符串是否是中文
 * @param {string} str 字符串
 */
export const isChinese = (str: string) => {
  const pattern = new RegExp("[\u4E00-\u9FA5]+");
  return pattern.test(str);
};
/**
 * @description: 计算字符串占位长度
 * @param {string} str 目标字符串
 */
export function countStringLength(str: string | number): number {
  if (!str) return 0;
  // 中文字符范围
  const chWidth = 2;
  const nChWidth = 1;
  let strArr = str.toString().split("");
  let re = strArr.map((s) => {
    // 是否为中文
    if (isChinese(s)) {
      return chWidth;
    } else {
      return nChWidth;
    }
  });
  return re.reduce((total, r) => total + r, 0);
}

/**
 * @description: 数组对象中根据字符串排序
 * @param {Array} arr 数组
 * @param {string} field 对象中的key
 * @param {boolean} rev 升序或者降序
 */
export function sortByString(arr: any[], field: string, rev: boolean) {
  let list = JSON.parse(JSON.stringify(arr));
  return list.sort((a, b) => {
    return rev
      ? a[field].localeCompare(b[field], "zh-CN", { numeric: true })
      : -a[field].localeCompare(b[field], "zh-CN", { numeric: true });
  });
}

/**
 * @description:数字转化成excel位置
 * @param {number} number 要转换的数字
 */
export function numToExcelLocation(number: number) {
  let char = "";
  let array: any[] = [];
  let numToStringAction = function (nnum: number) {
    let num: number = nnum - 1;
    let a = parseInt(num / 26);
    let b = num % 26;
    array.push(b);
    if (a > 0) {
      numToStringAction(a);
    }
  };
  numToStringAction(number);
  array = array.reverse();
  for (let i = 0; i < array.length; i++) {
    char += String.fromCharCode(64 + parseInt(array[i] + 1));
  }
  return char;
}

/**
 * @description: 处理从excel导入进来时间少47秒的问题
 * @param {Date} importedDate
 */
export const handelExcelDate = (importedDate: Date) => {
  const date = new Date(importedDate);
  date.setSeconds(date.getSeconds() + 47);
  return date;
};
/**
 * @description:防抖函数，单位时间内多次触发不执行函数
 * @param {Function} fn
 * @param {number} delay
 */
export function debounce(fn: Function, delay: number) {
  let timeout: any;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(this, arguments);
    }, delay);
  };
}

/**
 * @description: 节流函数，单位时间内只触发一次
 * @param {Function} fn
 * @param {number} delay
 */
export function throttle(fn: Function, delay: number) {
  let timer: any;
  return function () {
    if (!timer) {
      fn.apply(this, arguments);
      timer = setTimeout(() => {
        clearTimeout(timer);
        timer = null;
      }, delay);
    }
  };
}

/**
 * @description: 拆分数组
 * @param {T} arr 目标数组
 * @param {number} size 个数
 */
export function splitArray<T>(arr: T[], size: number): T[][] {
  let result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * @description: 生成范围数组
 * @param {number} start
 * @param {number} end
 */
export const makeRange = (start: number, end: number) => {
  const result: number[] = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
};

/**
 * @description: 验证time是否是符合格式的（时:分）
 * @param {*} time
 */
export function isJcTime(time: string) {
  return (
    time &&
    typeof time === "string" &&
    time.length === 5 &&
    time.indexOf(":") !== -1 &&
    time.split(":").length === 2
  );
}
/**
 * @description:将数字转化成标准时间:分钟格式。结果：1.输入错误返回空字符串 2.解析错误返回返回00：00
 * @param {*} timeStr 时间字符串（必须保证输入是数字或者.：:这三个符号）
 */
export function converTime(timeStr: string) {
  let time = "";
  // 设置标准格式的时间
  const setTime = function (hour, minute) {
    if (hour.length === 1) hour = "0" + hour;
    if (minute.length === 1) minute = "0" + minute;
    if (!hour || hour > 23) hour = "00";
    if (!minute || minute > 59) minute = "00";
    return `${hour}:${minute}`;
  };
  // 没填或者小于两位直接返回
  if (!timeStr || timeStr.length <= 2) return time;
  // 有分隔符
  try {
    let sign = timeStr.match(/[:|.|：]/g);
    if (sign && sign.length > 0) {
      let [hour, minute] = timeStr.replace(/[:|.|：]/g, ":").split(":");
      time = setTime(hour, minute);
    } else {
      // 没分隔符(思路是正则匹配后根据长度判断时间)
      let matches = timeStr.match(/(\d{3,4})|(\d{1,2}[.:]+\d{2})/);
      if (matches && matches.length > 0) {
        if (matches[0].length === 1) return;
        else if (matches[0].length === 2) {
          time = setTime(matches[0].slice(0, 1), matches[0].slice(1, 2));
        } else if (matches[0].length === 3) {
          time = setTime(matches[0].slice(0, 1), matches[0].slice(1, 3));
        } else {
          time = setTime(matches[0].slice(0, 2), matches[0].slice(2, 4));
        }
      }
    }
  } catch (error) {
    time = "";
  }
  return time;
}
/**
 * @description: 比较时间的大小(要保证传进来的格式是正确的哦)
 * @param {*} time1 时间1如：12:12
 * @param {*} time2 时间2如：15:08
 */
export function compareJcTime(time1: string, time2: string) {
  if (!isJcTime(time1) || !isJcTime(time2)) return 0;
  let t1 = new Date(`1970-01-01T${time1 || "00"}:00`);
  let t2 = new Date(`1970-01-01T${time2 || "00"}:00`);
  if (t1 > t2) {
    return 1;
  } else if (t1 < t2) {
    return -1;
  } else {
    return 0;
  }
}

/**
 * @description: 在日期的基础上加减天数
 * @param {*} date
 * @param {*} days
 */
export function addOrSubDate(date, days) {
  if (days == undefined || days == "") {
    days = 1;
  }
  function getFormatDate(arg) {
    if (arg == undefined || arg == "") {
      return "";
    }

    var re = arg + "";
    if (re.length < 2) {
      re = "0" + re;
    }

    return re;
  }
  var date = new Date(date);
  date.setDate(date.getDate() + days);
  var month = date.getMonth() + 1;
  var day = date.getDate();
  return (
    date.getFullYear() + "-" + getFormatDate(month) + "-" + getFormatDate(day)
  );
}

export function downloadBase64Img(content: string, fileName: string) {
  function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  function downloadFile(url, name) {
    var a = document.createElement("a"); //新建一个a链接
    a.setAttribute("href", url); // a链接的url为图片的url
    a.setAttribute("download", name);
    a.setAttribute("target", "_blank");
    let clickEvent = document.createEvent("MouseEvents");
    clickEvent.initEvent("click", true, true);
    a.dispatchEvent(clickEvent);
  }

  // 73so.com
  function downloadFileByBase64(base64, name) {
    var myBlob = dataURLtoBlob(base64);
    var myUrl = URL.createObjectURL(myBlob); //创建图片的临时url
    downloadFile(myUrl, name);
  }
  downloadFileByBase64(content, fileName);
}
/**
 * @description: 处理事件，过滤输入值的首尾空格
 * @param event - 触发的事件对象
 * @remarks
 * 该函数用于捕获输入事件，并自动去除输入值的首尾空格。
 * 它通过修改事件目标的值来实现这一点。
 */
export function filterLeadingTrailingSpaces(event) {
  const input = event.target;
  input.value = input.value.trim();
}

/**
 * @description: // 字符大小写转换
 * @param {*} arg
 */
export function strUpperAndLower(arg) {
  if (!arg) return "";
  // console.log('strUpperAndLower', arg);
  var str = arg.split("");
  for (var i = 0; i < str.length; i++) {
    let reg1 = /[A-Z]/;
    let reg2 = /[a-z]/;
    // 是大写字母
    if (reg1.test(str[i])) {
      str[i] = str[i].toLowerCase();
    } else if (reg2.test(str[i])) {
      // 是小写字母
      str[i] = str[i].toUpperCase();
    } else {
      str[i] = str[i];
    }
  }
  return str.join("");
}
/**
 * @description: 计算父级元素减去若干子元素和固定高度后的剩余高度
 * @param options.parentClass 父级元素class（如 .container）
 * @param options.excludeClasses 需要减去的子级元素class数组（如 ['.header', '.footer']）
 * @param options.excludeHeights 需要减去的固定高度数组（如 [50, 100]）
 * @returns 剩余高度（单位 px，number）
 */
export function calcRemainHeight(options: {
  parentClass: string;
  excludeClasses?: string[];
  excludeHeights?: number[];
}): number {
  const { parentClass, excludeClasses = [], excludeHeights = [] } = options;
  const parent = document.getElementsByClassName(
    parentClass
  )?.[0] as HTMLElement;
  if (!parent) return 0;
  let totalExcludeHeight = 0;
  // 计算所有子级class的高度
  excludeClasses.forEach((cls) => {
    const el = document.getElementsByClassName(cls)?.[0] as HTMLElement;
    if (el) {
      totalExcludeHeight += el.offsetHeight;
    }
  });
  // 计算所有固定高度
  excludeHeights.forEach((h) => {
    totalExcludeHeight += h;
  });
  // 返回剩余高度
  return parent.offsetHeight - totalExcludeHeight;
}
