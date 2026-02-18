import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PessoaService } from './services/pessoa.service';
import { Pessoa } from './models/pessoa';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  pessoas: Pessoa[] = [];
  pessoasFiltradas: Pessoa[] = [];
  pessoasPaginadas: Pessoa[] = [];

  pessoa: Pessoa = {
    nome: '',
    email: '',
    telefone: ''
  };

  modoEdicao: boolean = false;
  carregando: boolean = false;
  busca: string = '';

  ordem: 'asc' | 'desc' = 'asc';

  paginaAtual: number = 1;
  itensPorPagina: number = 5;
  totalPaginas: number = 1;

  constructor(
    private pessoaService: PessoaService,
    private cdr: ChangeDetectorRef
  ) { }


  ngOnInit(): void {
    this.carregarPessoas();
  }

  carregarPessoas() {
    this.carregando = true;
    this.pessoaService.listar().subscribe({
      next: (data) => {
        this.pessoas = data;
        this.filtrar();
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar pessoas:', err);
        this.carregando = false;
      }
    });
  }

  salvar() {
    if (!this.pessoa.nome || !this.pessoa.email || !this.pessoa.telefone) {
      alert('Preencha todos os campos!');
      return;
    }

    if (!this.telefoneValido()) {
      alert('Telefone inválido! Use o formato (00) 00000-0000');
      return;
    }

    this.carregando = true;

    if (this.modoEdicao && this.pessoa._id) {
      this.pessoaService.atualizar(this.pessoa).subscribe({
        next: () => {
          this.cancelarEdicao();
          this.carregarPessoas();
        },
        error: (err) => {
          console.error('Erro ao atualizar:', err);
          this.carregando = false;
        }
      });
    } else {
      this.pessoaService.cadastrar(this.pessoa).subscribe({
        next: () => {
          this.cancelarEdicao();
          this.carregarPessoas();
        },
        error: (err) => {
          console.error('Erro ao cadastrar:', err);
          this.carregando = false;
        }
      });
    }
  }


  editar(p: Pessoa) {
    this.pessoa = { ...p };
    this.modoEdicao = true;
  }

  cancelarEdicao() {
    this.pessoa = { nome: '', email: '', telefone: '' };
    this.modoEdicao = false;
    this.carregando = false;
  }

  excluir(id: string) {
    if (!confirm('Deseja realmente excluir esta pessoa?')) return;

    this.carregando = true;
    this.pessoaService.remover(id).subscribe({
      next: () => {
        this.carregarPessoas();
      },
      error: (err) => {
        console.error('Erro ao excluir:', err);
        this.carregando = false;
      }
    });
  }

  filtrar() {
    const termo = this.busca.toLowerCase();

    this.pessoasFiltradas = this.pessoas.filter(p =>
      p.nome.toLowerCase().includes(termo)
    );

    this.ordenarInterno();

    this.paginaAtual = 1;

    this.atualizarPaginacao();
  }

  ordenar() {
    this.ordenarInterno();
    this.atualizarPaginacao();
  }

  private ordenarInterno() {
    this.pessoasFiltradas.sort((a, b) => {
      const nomeA = a.nome.toLowerCase();
      const nomeB = b.nome.toLowerCase();

      if (this.ordem === 'asc') {
        return nomeA.localeCompare(nomeB);
      } else {
        return nomeB.localeCompare(nomeA);
      }
    });
  }

  atualizarPaginacao() {
    this.totalPaginas = Math.ceil(this.pessoasFiltradas.length / this.itensPorPagina) || 1;

    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;

    this.pessoasPaginadas = this.pessoasFiltradas.slice(inicio, fim);
  }

  proximaPagina() {
    if (this.paginaAtual < this.totalPaginas) {
      this.paginaAtual++;
      this.atualizarPaginacao();
    }
  }

  paginaAnterior() {
    if (this.paginaAtual > 1) {
      this.paginaAtual--;
      this.atualizarPaginacao();
    }
  }


  atualizarFiltro() {
    const termo = (this.busca || '').toLowerCase().trim();

    if (!termo) {
      this.pessoasFiltradas = [...this.pessoas];
      return;
    }

    this.pessoasFiltradas = this.pessoas.filter(p =>
      p.nome.toLowerCase().includes(termo)
    );
  }

  aplicarMascaraTelefone() {
    if (!this.pessoa.telefone) return;

    let numeros = this.pessoa.telefone.replace(/\D/g, '');

    numeros = numeros.substring(0, 11);

    if (numeros.length <= 2) {
      this.pessoa.telefone = `(${numeros}`;
    }
    else if (numeros.length <= 7) {
      this.pessoa.telefone = `(${numeros.substring(0, 2)}) ${numeros.substring(2)}`;
    }
    else {
      this.pessoa.telefone = `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7, 11)}`;
    }
  }

  telefoneValido(): boolean {
    if (!this.pessoa.telefone) return false;

    const regex = /^\(\d{2}\)\s\d{5}-\d{4}$/;
    return regex.test(this.pessoa.telefone);
  }

}
