import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "/Users/aiden/Desktop/Demo/PosDataSystem/outputs/feature-description";
const outputPath = path.join(outputDir, "POS数据管理平台-功能描述文档.xlsx");

const rows = [
  {
    module: "登录页",
    item: "账号登录",
    desc: [
      "1: 用户通过登录页进入 POS 数据管理平台。",
      "2: 支持输入登录账号和密码完成身份认证。",
      "3: 登录成功后进入首页概览，系统根据用户角色加载可访问菜单与数据范围。"
    ].join("\n"),
    interaction: [
      "1: 输入账号、密码后点击登录。",
      "2: 支持显示/隐藏密码。",
      "3: 登录失败时提示账号或密码错误。"
    ].join("\n"),
    note: "登录后权限由用户绑定角色决定，控制首页、文件收取、质量检查、台账与汇总、系统设置等模块访问范围。"
  },
  {
    module: "首页概览",
    item: "平台总览",
    desc: [
      "1: 展示平台当前标准 POS 明细总数及各区域门店数据规模。",
      "2: 支持查看东北、华北、华东、华南、华中、西北、全国渠道等区域分布。",
      "3: 提供“进入台账与汇总”快捷入口，便于从总览直接进入明细分析。"
    ].join("\n"),
    note: "数据用于管理层快速掌握全量 POS 数据规模和区域分布情况。"
  },
  {
    module: "首页概览",
    item: "文件收取看板",
    desc: [
      "1: 展示应收文件数、已收文件数、异常文件数、文件收取率。",
      "2: 按区域展示文件收取进度，包含已收、异常、应收及完成率。",
      "3: 支持“明细预览”，弹窗查看门店级文件收取明细。"
    ].join("\n"),
    note: "明细预览字段包含 ACC、门店名称、门店编码、本部（区域）、营业所、经销商门店、状态。"
  },
  {
    module: "首页概览",
    item: "质量检查看板",
    desc: [
      "1: 展示应检门店数、通过门店数、异常门店数、质检通过率。",
      "2: 按区域展示门店数据校验量，包含通过、异常、应检及完成率。",
      "3: 支持“明细预览”，弹窗查看门店质量检查明细。"
    ].join("\n"),
    note: "用于跟踪门店数据校验进展和异常分布，支持跳转质量检查模块继续处理。"
  },
  {
    module: "文件收取",
    item: "文件箱",
    desc: [
      "1: 管理各门店 POS 原始文件收取单据，展示标题、内容、状态、附件数、材料提供人、材料提供时间。",
      "2: 支持按文件名称模糊搜索和按状态筛选。",
      "3: 子附件支持展开查看附件名称、附件状态、异常说明与操作。"
    ].join("\n"),
    note: "父级状态包含正常、待处理、驳回、校验中；任一子附件处于校验中时，父级显示校验中。"
  },
  {
    module: "文件收取",
    item: "上传文件",
    desc: [
      "1: 支持新增上传单据，填写标题、内容、年月、本地文件。",
      "2: 年月组件采用年度和月份下拉样式。",
      "3: 上传完成后进入附件校验流程，材料提供时间精确到时分秒。"
    ].join("\n"),
    note: "上传附件可根据识别结果流入已匹配数据、未匹配数据或待处理附件。"
  },
  {
    module: "文件收取",
    item: "待处理附件处理",
    desc: [
      "1: 待处理附件支持“覆盖”“忽略”两个操作。",
      "2: 针对重复、文件异常等附件展示异常说明。",
      "3: 可通过状态筛选快速定位待处理附件。"
    ].join("\n"),
    note: "“覆盖”筛选项已调整为“待处理”，与附件状态保持一致。"
  },
  {
    module: "文件收取",
    item: "单门店已匹配数据",
    desc: [
      "1: 展示年月、原始门店名称、原始门店编码、门店名称（客户名称）、门店编码（客户编码）、经销商、ACC、本部、营业所、处理人、状态、操作。",
      "2: 除处理人和状态外，其余字段支持编辑。",
      "3: 本部与营业所联动：切换本部后营业所自动清空，保存时必须重新选择营业所。",
      "4: 支持通过、驳回、编辑、预览和质量检查。"
    ].join("\n"),
    note: "状态已统一为“待通过”。质检结束后弹窗展示校验总数、正常数、异常数及同步去向。"
  },
  {
    module: "文件收取",
    item: "单门店未匹配数据",
    desc: [
      "1: 复用已匹配数据表头结构，展示原始门店名称、原始门店编码、客户名称/编码、经销商、ACC、本部、营业所、异常原因、处理人、操作。",
      "2: 年月、原始门店名称、原始门店编码、处理人保留模拟数据，其余字段可为空白。",
      "3: 支持门店名称/编码校验、驳回、编辑和预览。"
    ].join("\n"),
    note: "未匹配数据预览复用已匹配预览的编辑逻辑，避免重复维护。"
  },
  {
    module: "文件收取",
    item: "预览与行级编辑",
    desc: [
      "1: 已匹配和未匹配单据均支持点击门店名称进入预览。",
      "2: 预览页支持编辑明细行，修改后关闭前会判断是否存在未保存修改。",
      "3: 预览编辑逻辑可复用，覆盖已匹配、未匹配及质量检查预览。"
    ].join("\n"),
    note: "若用户修改后未保存并关闭，系统弹窗提醒继续编辑或放弃修改。"
  },
  {
    module: "质量检查",
    item: "标准POS表",
    desc: [
      "1: 展示标准 POS 数据，支持标准表和明细数据视图切换。",
      "2: 支持组织架构、Team、置信度、状态等筛选及关键字检索。",
      "3: 门店名称高亮显示，支持点击进入标准 POS 表预览。",
      "4: 明细行支持编辑，但 AI判断、置信度、异常类型、状态不支持编辑。"
    ].join("\n"),
    note: "门店级编辑后，门店名称仍保持可点击进入预览。"
  },
  {
    module: "质量检查",
    item: "异常数据",
    desc: [
      "1: 展示异常门店和异常明细，支持文件数据/明细数据视图切换。",
      "2: 支持异常类型、状态、组织范围等筛选。",
      "3: 支持通过、驳回、删除和编辑。",
      "4: 驳回时可下拉选择驳回至营业 Team。"
    ].join("\n"),
    note: "异常数据保留异常类型与 AI 判断说明，用于人工复核和回退处理。"
  },
  {
    module: "质量检查",
    item: "数据预览",
    desc: [
      "1: 标准 POS 表和异常数据均支持点击门店名称进入预览。",
      "2: 预览页支持编辑当前标准/异常门店数据。",
      "3: 右上角提供编辑、全屏、关闭操作。"
    ].join("\n"),
    note: "编辑按钮位置和行为参考文件收取-已匹配预览。"
  },
  {
    module: "质量检查",
    item: "原始数据对比",
    desc: [
      "1: 预览页支持进入“原始数据对比”。",
      "2: 对比页左侧展示原始门店数据，只读不可编辑。",
      "3: 对比页右侧展示当前标准门店数据或异常数据，支持编辑。",
      "4: 上下滚动时固定表头和表格边界，避免顶部空白造成视觉干扰。"
    ].join("\n"),
    note: "底部关闭和保存按钮已移除，关闭通过右上角按钮完成，保存通过右上角编辑完成按钮完成。"
  },
  {
    module: "台账与汇总",
    item: "标准POS明细",
    desc: [
      "1: 展示年月、ACC、经销商名称、门店编码、门店名称、产品A码、产品名称、69码、销售数量、销售金额、销售成本、零售价、操作。",
      "2: 支持关键字查询、期间筛选、所属组织筛选和重置筛选。",
      "3: 产品A码统一使用 A 开头的 8 位编码。"
    ].join("\n"),
    note: "ACC 采用其它、北京物美、怀化佳惠、南阳万德隆、新玛特等口径，不再使用区域名称。"
  },
  {
    module: "台账与汇总",
    item: "分组汇总",
    desc: [
      "1: 支持不分组、区域、营业所、经销商、ACC 分组。",
      "2: 分组后可按所选维度汇总展示销售数量、销售金额、销售成本、零售价等数据。",
      "3: 分组面板支持展开和收起。"
    ].join("\n"),
    note: "用于不同管理口径下快速查看 POS 明细汇总结果。"
  },
  {
    module: "台账与汇总",
    item: "导出",
    desc: [
      "1: 支持导出当前筛选范围内的台账明细。",
      "2: 导出前可先通过关键字、期间、组织范围、分组方式调整数据范围。",
      "3: 系统日志记录导出行为。"
    ].join("\n"),
    note: "导出范围与当前页面筛选条件保持一致。"
  },
  {
    module: "系统设置",
    item: "用户管理",
    desc: [
      "1: 支持新增、编辑、禁用、重置密码、删除用户。",
      "2: 新增用户字段包含用户姓名、登录账号、初始密码、邮箱、分配角色、账号状态，均为必填。",
      "3: 用户保存后继承所选角色的功能权限和数据权限。"
    ].join("\n"),
    note: "手机号/邮箱字段已调整为邮箱；必填标识与字段名同行展示。"
  },
  {
    module: "系统设置",
    item: "角色权限",
    desc: [
      "1: 支持角色查看、新建、编辑、删除。",
      "2: 按模块配置功能权限，覆盖首页概览、文件收取、质量检查、台账与汇总、系统设置。",
      "3: 权限动作包含查看、新建、编辑、上传、质检、通过、驳回、导出、删除等。"
    ].join("\n"),
    note: "用户不单独配置数据权限，系统按角色权限控制可访问范围。"
  },
  {
    module: "系统设置",
    item: "系统设置",
    desc: [
      "1: 提供系统日志查看和导出，记录登录登出、文件收取、质量检查、台账与汇总、系统设置等操作。",
      "2: 支持字段配置，字段会影响质量检查校验和台账表头展示。",
      "3: 用户菜单支持账号绑定，可绑定企业微信。"
    ].join("\n"),
    note: "组织架构入口已从系统设置下移除；企业微信绑定用于后续文件收取提醒和质检异常提醒。"
  }
];

const interactionMap = {
  "平台总览": "点击“进入台账与汇总”跳转至台账模块；区域数据卡片用于快速浏览数据规模。",
  "文件收取看板": "点击“明细预览”打开弹窗；点击“进入文件收取”跳转至文件收取模块。",
  "质量检查看板": "点击“明细预览”打开弹窗；点击“进入质量检查”跳转至质量检查模块。",
  "文件箱": "支持搜索、状态筛选、重置筛选；点击展开箭头查看子附件；点击上传文件新增单据。",
  "上传文件": "点击“上传文件”打开弹窗；选择年月和本地文件后确认上传；上传后触发校验反馈。",
  "待处理附件处理": "在待处理附件行点击“覆盖”或“忽略”；操作后刷新附件状态。",
  "单门店已匹配数据": "支持勾选单据批量质检/通过；点击编辑进入行内编辑；点击门店名称进入预览；点击驳回打开驳回弹窗。",
  "单门店未匹配数据": "点击“门店名称/编码校验”执行校验；点击编辑补充字段；点击门店名称进入预览；点击驳回打开驳回弹窗。",
  "预览与行级编辑": "点击右上角编辑按钮进入编辑态；编辑后点击勾选保存；关闭前若未保存会弹窗确认。",
  "标准POS表": "支持筛选、检索、视图切换；点击门店名称打开预览；点击操作列编辑、通过或删除。",
  "异常数据": "支持筛选、检索、视图切换；点击操作列编辑、通过、驳回或删除；驳回时下拉选择处理 Team。",
  "数据预览": "点击门店名称打开预览；右上角支持编辑、全屏、关闭；编辑后通过勾选按钮保存。",
  "原始数据对比": "点击“原始数据对比”进入双栏对比；左侧只读，右侧可编辑；关闭时校验未保存修改。",
  "标准POS明细": "输入关键字查询；调整期间、组织范围后刷新列表；点击操作列查看明细。",
  "分组汇总": "点击“分组”打开分组面板；选择不分组、区域、营业所、经销商或 ACC 后刷新汇总结果。",
  "导出": "点击“导出”按当前筛选条件生成导出文件；导出行为写入系统日志。",
  "用户管理": "点击新增用户打开弹窗；填写必填字段后保存；列表中可编辑、禁用、重置密码或删除。",
  "角色权限": "点击新增/编辑角色配置模块权限；勾选功能动作后保存角色。",
  "系统设置": "在系统日志中筛选和导出；在字段配置中调整校验与台账展示字段；用户菜单中进入账号绑定。"
};

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("功能描述");
sheet.showGridLines = false;

const header = [["功能模块", "功能项", "描述", "交互", "备注"]];
const data = rows.map((row) => [row.module, row.item, row.desc, row.interaction || interactionMap[row.item] || "-", row.note]);

sheet.getRange("A1:E1").values = header;
sheet.getRangeByIndexes(1, 0, data.length, 5).values = data;

sheet.freezePanes.freezeRows(1);

sheet.getRange("A1:E1").format.fill.color = "#F5F5F5";
sheet.getRange("A1:E1").format.font.bold = true;
sheet.getRange("A1:E1").format.font.size = 12;
sheet.getRange("A1:E1").format.horizontalAlignment = "Center";
sheet.getRange("A1:E1").format.verticalAlignment = "Center";
sheet.getRange("A1:E1").format.rowHeight = 28;

const usedRange = sheet.getRange(`A1:E${rows.length + 1}`);
usedRange.format.font.name = "Arial";
usedRange.format.font.size = 11;
usedRange.format.wrapText = true;
usedRange.format.verticalAlignment = "Top";
usedRange.format.borders = { preset: "all", style: "thin", color: "#BFBFBF" };

sheet.getRange(`A2:A${rows.length + 1}`).format.horizontalAlignment = "Center";
sheet.getRange(`A2:A${rows.length + 1}`).format.verticalAlignment = "Center";
sheet.getRange(`B2:B${rows.length + 1}`).format.verticalAlignment = "Center";

sheet.getRange("A:A").format.columnWidth = 16;
sheet.getRange("B:B").format.columnWidth = 28;
sheet.getRange("C:C").format.columnWidth = 68;
sheet.getRange("D:D").format.columnWidth = 48;
sheet.getRange("E:E").format.columnWidth = 48;

for (let i = 0; i < rows.length; i += 1) {
  sheet.getRangeByIndexes(i + 1, 0, 1, 5).format.rowHeight = 104;
}

let startRow = 2;
while (startRow <= rows.length + 1) {
  const module = rows[startRow - 2].module;
  let endRow = startRow;
  while (endRow <= rows.length + 1 && rows[endRow - 2]?.module === module) {
    endRow += 1;
  }
  if (endRow - startRow > 1) {
    const mergeRange = sheet.getRange(`A${startRow}:A${endRow - 1}`);
    mergeRange.merge();
    mergeRange.values = [[module]];
    mergeRange.format.horizontalAlignment = "Center";
    mergeRange.format.verticalAlignment = "Center";
    mergeRange.format.font.bold = true;
  }
  startRow = endRow;
}

const moduleBreakRows = [];
for (let i = 1; i < rows.length; i += 1) {
  if (rows[i].module !== rows[i - 1].module) moduleBreakRows.push(i + 1);
}
for (const row of moduleBreakRows) {
  sheet.getRange(`A${row}:E${row}`).format.borders = { preset: "outside", style: "medium", color: "#A6A6A6" };
}

sheet.getRange("A1:E1").format.borders = { preset: "all", style: "thin", color: "#A6A6A6" };
sheet.getRange(`A1:E${rows.length + 1}`).format.borders = { preset: "outside", style: "medium", color: "#A6A6A6" };

await fs.mkdir(outputDir, { recursive: true });

const inspect = await workbook.inspect({
  kind: "table",
  sheetId: "功能描述",
  range: `A1:E${rows.length + 1}`,
  tableMaxRows: 8,
  tableMaxCols: 5,
  maxChars: 6000
});
console.log(inspect.ndjson);

const renderBlob = await workbook.render({ sheetName: "功能描述", range: `A1:E${rows.length + 1}`, scale: 1, format: "png" });
await fs.writeFile(path.join(outputDir, "功能描述预览.png"), new Uint8Array(await renderBlob.arrayBuffer()));

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(outputPath);
