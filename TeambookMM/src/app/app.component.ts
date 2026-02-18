import { Component, OnInit } from '@angular/core';
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

  pessoa: Pessoa = {
    nome: '',
    email: '',
    telefone: ''
  };

  modoEdicao: boolean = false;
  busca: string = '';
  carregando: boolean = false;

  constructor(private pessoaService: PessoaService) { }

  ngOnInit(): void {
    this.carregarPessoas();
  }

  carregarPessoas() {
    this.carregando = true;
    this.pessoaService.listar().subscribe({
      next: (data) => {
        this.pessoas = data;
        this.atualizarFiltro();
        this.carregando = false;
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

    this.carregando = true;

    if (this.modoEdicao && this.pessoa._id) {
      // UPDATE (NeDB)
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
      // CREATE (NeDB)
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
    this.atualizarFiltro();
  }

  atualizarFiltro() {
    const termo = this.busca.toLowerCase();
    this.pessoasFiltradas = this.pessoas.filter(p =>
      p.nome.toLowerCase().includes(termo)
    );
  }
}
