const I18n = {
  dictionary: {},
  textOriginals: new WeakMap(),
  attrOriginals: new WeakMap(),
  observer: null,
  updateTimer: null,
  isUpdating: false,

  krPhrases: {
    'POS数据管理平台': 'POS 데이터 관리 플랫폼',
    'POS 数据管理平台': 'POS 데이터 관리 플랫폼',
    '数据收取、质检、台账与接口输出统一工作台': '데이터 수집, 품질 검사, 원장 및 인터페이스 출력을 통합한 워크스페이스',
    '首页概览': '대시보드',
    '文件收取': '파일 수집',
    '质量检查': '품질 검사',
    '台账与汇总': '원장 및 집계',
    '切换导航': '내비게이션 전환',
    '退出登录': '로그아웃',

    '数据咨询助手': '데이터 상담 도우미',
    '数据咨询会话': '데이터 상담 대화',
    '新建对话': '새 대화',
    '历史会话': '대화 이력',
    '全屏': '전체 화면',
    '关闭': '닫기',
    '发送': '전송',
    '请输入查询年月与门店名称，检索对应门店 POS 数据': '조회 연월과 매장명을 입력해 해당 매장 POS 데이터를 검색하세요',
    '咨询内容': '상담 내용',
    '您好，我可以按照年月与门店名称，查询数据并生产EXCEL': '안녕하세요. 연월과 매장명으로 데이터를 조회하고 Excel을 생성할 수 있습니다',
    '已生成 Excel 结果': 'Excel 결과 생성 완료',
    '已生成': '생성 완료',
    '万象城店': '완샹청점',
    '明洞店': '명동점',
    '华北旗舰店': '화북 플래그십점',
    '东北直营店': '동북 직영점',
    'POS明细Excel': 'POS 상세 Excel',
    'POS 明细 Excel': 'POS 상세 Excel',
    'POS数据附件': 'POS 데이터 첨부',
    'POS数据压缩包': 'POS 데이터 압축 파일',
    'POS数据': 'POS 데이터',
    'POS Excel 已就绪': 'POS Excel 준비 완료',
    '在线预览': '온라인 미리보기',
    '下载 Excel': 'Excel 다운로드',
    '在线预览数据': '온라인 미리보기 데이터',
    '商品条码': '상품 바코드',
    '商品名称': '상품명',
    '销售日期': '판매일',
    '销量': '판매량',
    '销售额': '매출액',
    '条明细': '개 상세',
    '条记录': '건 기록',

    '选择年份': '연도 선택',
    '选择月份': '월 선택',
    '请选择月份': '월을 선택하세요',
    '总文件数': '전체 파일 수',
    '待处理数量': '처리 대기 수량',
    '当日接入量': '당일 접수량',
    '处理完成率': '처리 완료율',
    '需优先处理': '우선 처리 필요',
    '同比': '전년 대비',
    '文件收取趋势': '파일 수집 추이',
    '营业Team占比': '영업 Team 비중',
    'POS数据来源结构': 'POS 데이터 출처 구조',
    '总POS表': '전체 POS 표',
    '待处理队列': '처리 대기 목록',
    '文件收取中需优先关注的事项': '파일 수집 중 우선 확인 항목',
    '全部 Team': '전체 Team',
    '营业Team': '영업 Team',
    '文件名称': '파일명',
    '状态': '상태',
    '处理人': '처리자',
    '操作': '작업',
    '全部': '전체',
    '应收': '예정',
    '文件': '파일',
    '上一页': '이전',
    '下一页': '다음',
    '共': '총',
    '条数据': '개 데이터',
    '降序': '내림차순',
    '升序': '오름차순',
    '排序': '정렬',
    'Team 数据提交进度': 'Team 데이터 제출 진행률',
    '数据提报进度': '데이터 제출 진행률',
    '按照队列数据状况并排按完成情况': '대기열 데이터 상태에 따라 완료 현황 표시',
    '按照队列数据状况并排提交完成情况': '대기열 데이터 상태에 따라 제출 완료 현황 표시',
    'POS担当': 'POS 담당',

    '各区域文件收取情况': '지역별 파일 수집 현황',
    '文件收取率': '파일 수집률',
    '已收文件 / 应收文件': '수신 파일 / 예정 파일',
    '已收文件': '수신 파일',
    '应收文件': '예정 파일',
    '收件箱': '받은 편지함',
    '原始门店数据列表': '원본 매장 데이터 목록',
    '归档（非POS表）': '보관(비POS표)',
    '归档(非POS表)': '보관(비POS표)',
    '暂存数据': '임시 저장 데이터',
    '请输入文件名称模糊搜索': '파일명을 입력해 검색',
    '全部状态': '전체 상태',
    '待处理': '처리 대기',
    '已处理': '처리 완료',
    '全选': '전체 선택',
    '重置筛选': '필터 초기화',
    '筛选': '필터',
    '上传文件': '파일 업로드',
    '请先勾选至少一条数据': '데이터를 하나 이상 선택하세요',
    '加载中...': '로딩 중...',
    '暂无收件箱数据': '받은 편지함 데이터가 없습니다',
    '暂无符合条件的文件数据': '조건에 맞는 파일 데이터가 없습니다',
    '来源邮件': '출처 이메일',
    '来源附件': '출처 첨부',
    '附件': '첨부',
    '处理人信息': '처리자 정보',
    '操作按钮': '작업 버튼',
    '标题': '제목',
    '内容': '내용',
    '附件数': '첨부 수',
    '材料提供人': '자료 제공자',
    '材料提供时间': '자료 제공일',
    'AI建议': 'AI 제안',
    '附件名称': '파일명',
    '附件状态': '파일 상태',
    '文件状态': '파일 상태',
    '异常说明': '이상 설명',
    '来源方式': '출처 방식',
    '系统上传': '시스템 업로드',
    '邮件上传': '메일 업로드',
    '附件预览': '첨부 미리보기',
    'Excel 列表': 'Excel 목록',
    '默认预览': '기본 미리보기',
    '可切换预览': '전환 가능 미리보기',
    '工作表': '워크시트',
    '共 5 条预览记录': '미리보기 5건',
    '文件异常、无法预览': '파일 이상으로 미리볼 수 없습니다',
    '文件损坏、打不开': '파일이 손상되어 열 수 없습니다',
    '文件加密，打不开': '파일이 암호화되어 열 수 없습니다',
    '文件损坏，打不开': '파일이 손상되어 열 수 없습니다',
    '文件无法打开': '파일을 열 수 없습니다',
    '压缩包不能解压': '압축 파일을 풀 수 없습니다',
    '文件损坏': '파일 손상',
    '打不开': '열 수 없음',
    '日明细式错误': '일자 상세 오류',
    '数据不完整': '데이터 불완전',
    '门店名称或门店编码缺失': '매장명 또는 매장코드 누락',
    '请修改文件标题确保包含门店信息': '파일 제목에 매장 정보가 포함되도록 수정해 주세요',
    '请先补充缺失的销售记录行后重新上传': '누락된 판매 행을 보완한 뒤 다시 업로드해 주세요',
    '请提供未加密的原始文件后重新上传': '암호화되지 않은 원본 파일을 다시 업로드해 주세요',
    '请查收': '확인 바랍니다',
    '烦请完成收取与质检': '수집 및 품질 검사를 완료해 주세요',
    '12月门店数据': '12월 매장 데이터',
    '门店数据': '매장 데이터',
    '数据压缩包': '데이터 압축 파일',
    '销售明细': '판매 상세',
    '确认驳回该附件？': '이 첨부 파일을 반려하시겠습니까?',
    '驳回附件': '첨부 파일 반려',
    '已驳回附件': '첨부 파일이 반려되었습니다',
    '人工驳回': '수동 반려',
    '移动原始数据': '원본 데이터 이동',
    '原始门店数据': '원본 매장 데이터',
    '已移动到原始门店数据列表': '원본 매장 데이터 목록으로 이동했습니다',
    '移动到收件箱': '받은 편지함으로 이동',
    '已移动到收件箱': '받은 편지함으로 이동했습니다',
    '归档数据': '보관 데이터',
    'AI校验': 'AI 검증',
    '归档': '보관',
    '通过': '승인',
    '驳回': '반려',
    '确认': '확인',
    '取消': '취소',
    '保存': '저장',
    '编辑': '편집',
    '预览': '미리보기',
    '全屏查看': '전체 화면 보기',
    '退出全屏': '전체 화면 종료',
    '点击预览': '클릭하여 미리보기',
    '预览附件': '첨부 미리보기',
    '已保存': '저장되었습니다',
    '驳回文件': '파일 반려',
    '文件异常现象': '파일 이상 현상',
    '确认驳回': '반려 확인',
    '请填写文件异常现象': '파일 이상 현상을 입력해 주세요',
    '已成功驳回文件': '파일을 반려했습니다',
    '通过成功': '승인 완료',
    '归档成功': '보관 완료',
    '操作，确认后不可撤销，是否继续？': '작업을 실행하시겠습니까? 실행 후 되돌릴 수 없습니다.',
    '已通过': '승인됨',
    '已驳回': '반려됨',
    '已归档': '보관됨',
    '已同步': '동기화됨',
    '待处理': '처리 대기',
    '异常': '이상',
    '正常': '정상',

    '各区域门店数据校验量': '지역별 매장 데이터 검증량',
    '置信度通过率': '신뢰도 통과율',
    '通过文件 / 全部文件': '통과 파일 / 전체 파일',
    '标准POS表': '표준 POS 표',
    '异常数据': '이상 데이터',
    '组织架构': '조직 구조',
    '异常类型': '이상 유형',
    '高/中/低': '높음/중간/낮음',
    '搜索': '검색',
    '门店名称': '매장명',
    '门店编码': '매장코드',
    '置信度': '신뢰도',
    'AI判断': 'AI 판단',
    '所属营业Team': '소속 영업 Team',
    '所属区域': '소속 지역',
    '所属营业所': '소속 영업소',
    '所属经销商': '소속 대리점',
    '销售数量': '판매 수량',
    '销售金额': '판매 금액',
    '销售成本': '판매 원가',
    '零售价': '소매가',
    '异常原因': '이상 사유',
    '字段级': '필드 수준',
    '产品级': '제품 수준',
    '数据级': '데이터 수준',
    '确认驳回异常数据': '이상 데이터 반려 확인',
    '驳回原因（AI判断）': '반려 사유(AI 판단)',
    '驳回至营业 Team': '영업 Team으로 반려',
    '备注信息': '비고 정보',
    '请填写备注信息': '비고를 입력해 주세요',
    '说明：': '안내:',
    '驳回操作需针对门店级的完整 POS 表执行，而非单条数据。确认驳回后，该门店对应的所有状态将统一更新为「已驳回」': '반려 작업은 단일 데이터가 아닌 매장 단위의 전체 POS 표에 적용됩니다. 확인 후 해당 매장의 모든 상태가 "반려됨"으로 일괄 업데이트됩니다.',
    '已通过': '승인됨',
    '已暂存': '임시 저장됨',
    '暂无暂存数据': '임시 저장 데이터가 없습니다',
    '一级：营业Team': '1단계: 영업 Team',
    '二级：营业所': '2단계: 영업소',
    '三级：经销商': '3단계: 대리점',
    '暂无营业Team': '영업 Team 없음',
    '暂无营业所': '영업소 없음',
    '暂无经销商': '대리점 없음',
    '已选': '선택됨',
    '项': '개 항목',

    '总计': '합계',
    '数量': '수량',
    '单价': '단가',
    '条码': '바코드',
    '备注': '비고',
    '未知商品': '미확인 상품',
    '可口可乐': '코카콜라',
    '乐事薯片': '레이즈 감자칩',
    '康师傅红烧牛肉面': '캉스푸 홍샤오 우육면',
    '农夫山泉': '농푸산취안',

    '华北区域': '화북 지역',
    '东北区域': '동북 지역',
    '华东区域': '화동 지역',
    '华中区域': '화중 지역',
    '华南区域': '화남 지역',
    '西南区域': '서남 지역',
    '西北区域': '서북 지역',
    '华北 Team': '화북 Team',
    '东北 Team': '동북 Team',
    '华东 Team': '화동 Team',
    '华中 Team': '화중 Team',
    '华南 Team': '화남 Team',
    '西南 Team': '서남 Team',
    '西北 Team': '서북 Team',
    '华北': '화북',
    '东北': '동북',
    '华东': '화동',
    '华中': '화중',
    '华南': '화남',
    '西南': '서남',
    '西北': '서북',
    '北京营业所': '베이징 영업소',
    '天津营业所': '톈진 영업소',
    '石家庄营业所': '스자좡 영업소',
    '沈阳营业所': '선양 영업소',
    '郑州营业所': '정저우 영업소',
    '南京营业所': '난징 영업소',
    '上海营业所': '상하이 영업소',
    '杭州营业所': '항저우 영업소',
    '武汉营业所': '우한 영업소',
    '广州营业所': '광저우 영업소',
    '西安营业所': '시안 영업소',
    '兰州营业所': '란저우 영업소',
    '呼和浩特营业所': '후허하오터 영업소',

    '保定市聚昊商贸有限公司': '바오딩 쥐하오상무 유한회사',
    '多客隆购物中心（会盟大街）': '둬커룽 쇼핑센터(후이멍대로)',
    '邯郸市格耀商贸有限公司': '한단 거야오상무 유한회사',
    '韩百（韩百商场）': '한바이(한바이몰)',
    '家得乐（新民友谊商城）': '자더러(신민 우의몰)',
    '家家乐超市（大市场）': '자자러 슈퍼마켓(대시장)',
    '利好果蔬生活广场（鞍山腾鳌店）': '리하오 과채 생활광장(안산 텅아오점)',
    '台安家得乐超市': '타이안 자더러 슈퍼마켓',
    '利好生活广场（太和）': '리하오 생활광장(타이허)',
    '中心城大卖场（金鼎）': '중심성 대형마트(진딩)',
    '欧亚长青城（浑南中路）': '어우야 창칭청(훈난중로)',
    '维多利（赤峰松山万达）': '웨이둬리(츠펑 쑹산완다)',
    '煊超市邻里中心店（乐桃路）': '쉬안 슈퍼마켓 커뮤니티센터점(러타오로)',
    '好乐福超市（177县道）': '하오러푸 슈퍼마켓(177현도)',
    '家乐惠超市（宁县早胜店）': '자러후이 슈퍼마켓(닝현 자오성점)',
    '四海一家生活超市（南方花园）': '쓰하이이자 생활슈퍼(난팡화원)',
    '新世纪商厦（崇信县）': '신세기 상가(충신현)',
    '旺鲜生八佰伴店': '왕셴성 야오한점',
    '益尚客（太阳城）': '이상커(태양성)',
    '每日惠北塔': '메이르후이 베이타',
    '河北聚昊商贸': '허베이 쥐하오상무',
    '洛阳多客隆商贸': '뤄양 둬커룽상무',
    '邯郸格耀商贸': '한단 거야오상무',
    '韩百商业集团': '한바이 상업그룹',
    '家得乐商贸': '자더러상무',
    '家家乐连锁商业': '자자러 체인상업',
    '利好果蔬生活广场': '리하오 과채 생활광장',
    '利好生活广场': '리하오 생활광장',
    '中心城商业管理': '중심성 상업관리',
    '欧亚长青城商贸': '어우야 창칭청상무',
    '维多利商业': '웨이둬리상업',
    '煊超市连锁': '쉬안 슈퍼마켓 체인',
    '好乐福商贸': '하오러푸상무',
    '家乐惠商业': '자러후이상업',
    '四海一家生活超市': '쓰하이이자 생활슈퍼',
    '新世纪商厦': '신세기 상가',
    '旺鲜生商业': '왕셴성상업',
    '益尚客商贸': '이상커상무',
    '每日惠商贸': '메이르후이상무',

    '好丽友果滋果心黄金奇异果味软糖': '오리온 과즙젤리 골드키위맛',
    '好丽友果滋果心-百香果味软糖': '오리온 과즙젤리 패션프루트맛',
    '好丽友高纤坚果棒酸奶味': '오리온 고식이섬유 견과바 요거트맛',
    '好丽友高蛋白坚果棒太妃味': '오리온 고단백 견과바 토피맛',
    '好丽友蛋黄派': '오리온 달걀노른자 파이',
    '好丽友Q立方葡萄/西柚/菠萝木糖醇': '오리온 Q큐브 포도/자몽/파인애플 자일리톨',
    '好丽友Q立方草莓/香瓜/青梅木糖醇': '오리온 Q큐브 딸기/멜론/매실 자일리톨',
    '好丽友Q蒂榛子蛋糕': '오리온 Q티 헤이즐넛 케이크',
    '好丽友Q蒂巧克力莓果味': '오리온 Q티 초코베리맛',
    '好丽友Q蒂摩卡蛋糕': '오리온 Q티 모카 케이크',
    '好丽友Q蒂红丝绒派': '오리온 Q티 레드벨벳 파이',
    '好丽友好多鱼浓汤味': '오리온 고래밥 크림수프맛',
    '好丽友浪里个浪玉米浓汤味': '오리온 꼬북칩 옥수수수프맛',
    '好丽友薯愿番茄味': '오리온 감자칩 토마토맛',
    '好丽友派巧克力味': '오리온 초코파이',
    '条码对应两种规格商品，建议退回营业Team核对后重新上传': '바코드가 두 규격 상품에 대응됩니다. 영업 Team 확인 후 재업로드를 권장합니다',
    '销售数量缺失，无法校验销售额，已标记待人工核实': '판매 수량이 누락되어 매출액을 검증할 수 없어 수동 확인으로 표시했습니다',
    '销售金额缺失，已依据销售数量×零售价自动回填': '판매 금액이 누락되어 판매 수량×소매가 기준으로 자동 보완했습니다',
    '产品名称规格不完整，与标准品名映射失败': '상품명 규격이 불완전하여 표준 품명 매핑에 실패했습니다',
    '该69码在标准产品库中无匹配记录，疑似新品未入库或条码录入错误': '해당 69코드가 표준 상품 DB에 없어 신규 상품 미등록 또는 바코드 입력 오류로 보입니다',
    '销售数量异常偏高，偏离历史均值超过3倍标准差，建议人工核实': '판매 수량이 비정상적으로 높아 과거 평균 대비 3배 표준편차를 초과했습니다. 수동 확인을 권장합니다',
    '销售成本占销售金额比例为72%，与标准成本率不符，建议核查': '판매 원가가 매출액의 72%로 표준 원가율과 맞지 않습니다. 확인을 권장합니다',
    '零售价缺失，无法校验销售金额合理性，已根据历史价格回填': '소매가가 누락되어 매출액 합리성을 검증할 수 없어 과거 가격 기준으로 보완했습니다',
    '该产品69码与产品名称不匹配，系统产品库中69码对应的是玉米浓汤味而非烧烤味': '상품 69코드와 상품명이 일치하지 않습니다. 시스템 상품 DB의 69코드는 바비큐맛이 아닌 옥수수수프맛입니다',
    '产品名称完全缺失，仅凭69码无法唯一确认产品，建议与经销商确认': '상품명이 완전히 누락되어 69코드만으로 상품을 확정할 수 없습니다. 대리점 확인을 권장합니다',
    'ACC归属信息缺失，无法关联区域业绩统计，已标记': 'ACC 귀속 정보가 누락되어 지역 실적 통계와 연결할 수 없어 표시했습니다',
    '保定聚昊': '바오딩 쥐하오',
    '多客隆会盟大街': '둬커룽 후이멍대로',
    '邯郸格耀': '한단 거야오',
    '韩百商场': '한바이몰',
    '新民友谊商城': '신민 우의몰',
    '家家乐超市大市场店': '자자러 슈퍼마켓 대시장점',
    '四海一家南方花园': '쓰하이이자 난팡화원',
    '新世纪商厦崇信县店': '신세기 상가 충신현점',
    '利好生活广场太和店': '리하오 생활광장 타이허점',

    '周一': '월',
    '周二': '화',
    '周三': '수',
    '周四': '목',
    '周五': '금',
    '周六': '토',
    '周日': '일',
    '年': '년',
    '月': '월',
    '日': '일',
    '条': '개',
    '个': '개',
    '件': '건',
    '表': '표'
  },

  async init() {
    try {
      const res = await fetch('data/i18n.json?v=20260609-platform-title');
      this.dictionary = await res.json();
    } catch (e) {
      console.error('Failed to load i18n dictionary', e);
    }
    this.setupObserver();
    this.updateDOM();
  },

  toggle() {
    const state = Store.getState();
    const newLang = state.lang === 'cn' ? 'kr' : 'cn';
    Store.setState({ lang: newLang });
    document.documentElement.lang = newLang === 'kr' ? 'ko-KR' : 'zh-CN';

    const langText = document.getElementById('current-lang-text');
    if (langText) langText.textContent = newLang === 'kr' ? 'KR' : 'CN';

    if (typeof App !== 'undefined') {
      const viewName = Store.getState().currentView;
      if (viewName === 'login' && typeof LoginView !== 'undefined') {
        LoginView.mount();
      } else if (viewName) {
        App.mountView(viewName);
      }
    }

    if (typeof GlobalPeriod !== 'undefined') {
      GlobalPeriod.syncFromStore?.();
    }
    this.updateDOM();
  },

  t(key) {
    const lang = Store.getState().lang;
    return this.dictionary[key]?.[lang] || key;
  },

  setupObserver() {
    if (this.observer) return;
    this.observer = new MutationObserver(() => {
      if (this.isUpdating || Store.getState().lang !== 'kr') return;
      clearTimeout(this.updateTimer);
      this.updateTimer = setTimeout(() => this.updateDOM(), 0);
    });
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  },

  updateDOM() {
    this.isUpdating = true;
    try {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = this.t(key);
        if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
          el.setAttribute('placeholder', text);
        } else {
          el.textContent = text;
        }
      });

      const lang = Store.getState().lang;
      const langText = document.getElementById('current-lang-text');
      if (langText) langText.textContent = lang === 'kr' ? 'KR' : 'CN';
      document.documentElement.lang = lang === 'kr' ? 'ko-KR' : 'zh-CN';

      if (lang === 'kr') {
        this.applyKorean(document.body);
      } else {
        this.restoreChinese(document.body);
      }
    } finally {
      this.isUpdating = false;
    }
  },

  applyKorean(root) {
    this.translateAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (!/[\u4e00-\u9fff]/.test(node.nodeValue || '')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (!this.textOriginals.has(node)) this.textOriginals.set(node, node.nodeValue);
      node.nodeValue = this.translateToKorean(this.textOriginals.get(node));
    });
  },

  restoreChinese(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => this.textOriginals.has(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      node.nodeValue = this.textOriginals.get(node);
      this.textOriginals.delete(node);
    });

    root.querySelectorAll('[data-i18n-original-attrs]').forEach((el) => {
      const originals = this.attrOriginals.get(el);
      if (!originals) return;
      Object.entries(originals).forEach(([attr, value]) => el.setAttribute(attr, value));
      this.attrOriginals.delete(el);
      el.removeAttribute('data-i18n-original-attrs');
    });
  },

  translateAttributes(root) {
    const attrs = ['placeholder', 'title', 'aria-label'];
    root.querySelectorAll('*').forEach((el) => {
      attrs.forEach((attr) => {
        const value = el.getAttribute(attr);
        if (!value || !/[\u4e00-\u9fff]/.test(value)) return;
        const originals = this.attrOriginals.get(el) || {};
        if (!Object.prototype.hasOwnProperty.call(originals, attr)) originals[attr] = value;
        this.attrOriginals.set(el, originals);
        el.setAttribute('data-i18n-original-attrs', 'true');
        el.setAttribute(attr, this.translateToKorean(originals[attr]));
      });
    });
  },

  translateToKorean(text) {
    if (!text) return text;
    let result = String(text);
    const entries = Object.entries(this.krPhrases).sort((a, b) => b[0].length - a[0].length);
    entries.forEach(([cn, kr]) => {
      result = result.split(cn).join(kr);
    });
    result = result
      .replace(/，/g, ', ')
      .replace(/。/g, '.')
      .replace(/(\d{4})\s*년\s*(\d{1,2})\s*월/g, '$1년 $2월')
      .replace(/(\d+)\s*개\s*상세/g, '$1개 상세')
      .replace(/(\d+)\s*개\s*데이터/g, '$1개 데이터')
      .replace(/([\u4e00-\u9fff]+)/g, (match) => this.koreanizeUnknown(match));
    return result;
  },

  koreanizeUnknown(text) {
    if (!text) return '';
    if (text.length <= 2) return '항목';
    if (/店|超市|商场|广场|商城|中心|卖场|门店/.test(text)) return '매장';
    if (/公司|商贸|经销商|商业|集团|连锁/.test(text)) return '거래처';
    if (/商品|产品|名称|条码/.test(text)) return '상품';
    if (/数据|文件|附件|台账|表/.test(text)) return '데이터';
    if (/营业|区域|所属|组织/.test(text)) return '조직';
    if (/异常|错误|缺失|驳回/.test(text)) return '이상';
    return '항목';
  }
};
