
1. 2017.8.18::03:30

실행방법   서버> node server.js {원하는 포트번호}



2. 2017.8.19::21:30

테이터설계도 이미지파일추가
설계가정
 a. 모든 사용자는 다른 사용자가 등록한 제품목록을 볼 수 있다
 b. 일괄 검색된 제품목록중에 하나를 선택하여 관리자에 접근승인 요청한다
 c. 관리자는 확인후 승인한다.
 d. 사용자는 2가지로 분류(일반사용자-0, 관리자-1)
 e. 사물도 2가지로 분류(통신불가-0, 통신가능-1)
 f. 사물 및 사람의 인증서(비밀키,공개키,주소)는 웹브라우저에 저장하게 구현

3. 2017.8.23::01:00.

관리자 권한 수정, user.json 에서 userName = "admin" 이고 userAddress 가 있어야 관리자 권한 얻음.

4. 2017.9.3::19:00
Be care to use For( ) sentence in javascript.
Don't forget "const" in For() like this "For( const x in items)".

5. 2017.9.10:21:00

  convert JSON file into RDBMS as Cubrid made by Naver.
  be cautious of dataType between DB and Nodejs.   

## 6. 2018.4.29
   router/main.js   에서  multichain 서버 주소 주의 현재 주소는 nodejs 웹서버 주소로 되어 있음.
