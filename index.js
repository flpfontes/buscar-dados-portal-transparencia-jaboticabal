const puppeteer = require("puppeteer");
const fs = require("fs");

async function run() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("http://transparencia.jaboticabal.sp.gov.br/Salarios.aspx");

  const data = await page.evaluate(async () => {
    //procurar caixa de texto da busca
    const input = document.getElementById("Conteudo_txtFiltro");
    //setar valor A
    input.value = "A";

    //procurar botao de busca
    const btnSearch = document.getElementById("Conteudo_btnFiltrar");
    //clicar no botao de busca
    btnSearch.click();

    //aguardar site retornar dados
    await new Promise(function (resolve) {
      setTimeout(resolve, 5000);
    });

    //procurar elemento de tabela
    var table = document.getElementById("Conteudo_dgContratos");

    //contar quantidade de linhas na tabela
    var totalRowCount = table.rows.length;

    //cabeçalho
    var csv =
      "Matrícula;Nome do Servidor;Tipo da Folha;Cargo / Função;Data de Admissão;Salário Base;Salário Bruto;Deduções;Salário Líquido;Observações\n";

    //percorrer linhas
    for (var i = 1; i < totalRowCount; i++) {
      var row = "";

      //buscar colunas
      var cols = table.rows[i].querySelectorAll("td, th");

      var occupation = ""; //Cargo / Função
      var admission_date = ""; //Data de Admissão
      var base_salary = ""; //Salário Base
      var gross_salary = ""; //Salário Bruto
      var deductions = ""; //Deduções
      var net_salary = ""; //Salário Líquido
      var obs = ""; //

      //percorrer colunas
      for (var j = 0; j < cols.length; j++) {
        //na primeira coluna, abrir modal com informações extras
        if (j == 0) {
          var a = cols[j].querySelector("a");
          if (a) {
            a.click();
            await new Promise(function (resolve) {
              setTimeout(resolve, 4000);
            });

            occupation = document.getElementById("Conteudo_lblFuncao")
              .innerText;
            admission_date = document.getElementById(
              "Conteudo_lblDataAdmimissao"
            ).innerText;
            base_salary = document.getElementById("Conteudo_lblBase").innerText;
            gross_salary = document.getElementById("Conteudo_lblBruto")
              .innerText;
            deductions = document.getElementById("Conteudo_lblDeducao")
              .innerText;
            net_salary = document.getElementById("Conteudo_lblLiquido")
              .innerText;
            obs =
              "* Valores referentes a competência do mês de " +
              document.getElementById("Conteudo_lblMes").innerText;

            //buscar modal
            const modal = document.getElementById("Conteudo_upModal");

            //buscar botao de fechar modal
            const btnClose = modal.getElementsByClassName("close")[0];
            //fechar modal
            btnClose.click();
          }
        }

        row += String(cols[j].innerText).trim() + ";";
      }

      csv +=
        row +
        occupation +
        ";" +
        admission_date +
        ";" +
        base_salary +
        ";" +
        gross_salary +
        ";" +
        deductions +
        ";" +
        net_salary +
        ";" +
        obs +
        "\n";
    }

    return csv;
  });

  fs.writeFile("dados.csv", data, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("Arquivo salvo com sucesso");
  });

  await browser.close();
}

run();
