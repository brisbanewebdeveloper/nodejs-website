
'use strict';

function funcExample(target) {

  async function funcA() {

    await $.ajax({
      url: 'https://example.com/request',
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({paramA: 123, paramB: 'abc'}),
      dataType: 'json',
      success: res => {
        const varB = res.varA + 1;
        console.log('check', varB, res.varB);
      }
    });
  }

  function funcB() {
    console.log('funcB');
  }

  async function funcC() {
    await funcA();
    funcB();
  }
}

$(document).ready(() => {

  let target;

  target = $('#example-container');
  if (target.length > 0) funcExample(target);
});
