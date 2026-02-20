import { Metadata } from 'next';
import {
    LegalLayout, Section, SubSection, P, BulletList, HighlightBox
} from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
    title: 'Política de Privacidade — NorthWay Omni',
    description: 'Como coletamos, usamos e protegemos seus dados na plataforma NorthWay Omni.',
    robots: { index: true, follow: true },
};

export default function PrivacidadePage() {
    return (
        <LegalLayout
            title="Política de Privacidade"
            subtitle="Como coletamos, usamos e protegemos seus dados"
            version="1.0"
            updatedAt="20 de fevereiro de 2026"
        >
            <Section id="quem-somos" title="1. Quem Somos">
                <P>
                    A NorthWay Company, inscrita no CNPJ sob o nº 56.106.629/0001-75 ("nós", "nosso" ou
                    "Empresa"), é responsável pelo desenvolvimento e operação da plataforma Northway Omni,
                    acessível em omni.northwaycompany.com.br. Esta Política de Privacidade descreve como
                    coletamos, usamos, armazenamos e protegemos os dados pessoais de nossos usuários, em
                    conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018) e demais
                    legislações aplicáveis.
                </P>
                <P>
                    Para dúvidas ou solicitações relacionadas a esta política, entre em contato pelo e-mail:{' '}
                    <a href="mailto:marciogholmm@gmail.com" className="text-[#ff1f4b] hover:underline">
                        marciogholmm@gmail.com
                    </a>
                </P>
            </Section>

            <Section id="dados-coletados" title="2. Dados que Coletamos">
                <SubSection title="2.1 Dados fornecidos pelo usuário">
                    <BulletList items={[
                        'Nome completo e razão social',
                        'Endereço de e-mail e telefone',
                        'Dados de login (e-mail e senha criptografada)',
                        'Informações de pagamento (processadas por gateway certificado — não armazenamos dados de cartão)',
                        'Dados de contatos inseridos no CRM da plataforma',
                    ]} />
                </SubSection>
                <SubSection title="2.2 Dados coletados automaticamente">
                    <BulletList items={[
                        'Endereço IP e dados de acesso (logs)',
                        'Tipo de navegador, sistema operacional e dispositivo',
                        'Páginas acessadas, tempo de sessão e interações na plataforma',
                        'Cookies e tecnologias similares',
                    ]} />
                </SubSection>
                <SubSection title="2.3 Dados de integrações">
                    <BulletList items={[
                        'Informações de contas do WhatsApp Business conectadas via API oficial da Meta',
                        'Informações de contas do Instagram e Messenger conectadas via OAuth da Meta',
                        'Dados de leads e contatos importados pelo próprio usuário',
                    ]} />
                </SubSection>
            </Section>

            <Section id="uso-dados" title="3. Como Usamos os Dados">
                <P>Utilizamos os dados coletados para as seguintes finalidades:</P>
                <BulletList items={[
                    'Prestar e melhorar os serviços da plataforma Northway Omni',
                    'Gerenciar sua conta e autenticar seu acesso',
                    'Processar pagamentos e emitir cobranças e notas fiscais',
                    'Enviar comunicações sobre o serviço, atualizações e suporte',
                    'Cumprir obrigações legais e regulatórias',
                    'Prevenir fraudes e garantir a segurança da plataforma',
                    'Realizar análises agregadas para melhoria contínua do produto',
                ]} />
                <HighlightBox icon="🔒">
                    Não utilizamos seus dados para publicidade de terceiros, nem os vendemos ou
                    compartilhamos para fins comerciais externos.
                </HighlightBox>
            </Section>

            <Section id="compartilhamento" title="4. Compartilhamento de Dados">
                <P>Seus dados podem ser compartilhados com:</P>
                <BulletList items={[
                    'Fornecedores de infraestrutura e hospedagem (ex: Vercel, AWS) — apenas para operação do serviço',
                    'Gateway de pagamento (Asaas) — para processamento de cobranças',
                    'Meta Platforms (Facebook/Instagram/WhatsApp) — para integração com as APIs oficiais mediante sua autorização expressa',
                    'Autoridades competentes — quando exigido por lei ou ordem judicial',
                ]} />
                <P>Todos os fornecedores são contratualmente obrigados a proteger seus dados e utilizá-los apenas para as finalidades autorizadas.</P>
            </Section>

            <Section id="retencao" title="5. Retenção de Dados">
                <BulletList items={[
                    'Dados de conta ativa: enquanto a assinatura estiver ativa',
                    'Após cancelamento: até 30 dias para dados operacionais; até 5 anos para dados fiscais conforme exigência legal',
                    'Logs de acesso: até 6 meses conforme o Marco Civil da Internet (Lei nº 12.965/2014)',
                    'Dados de leads e contatos do CRM: conforme configuração do próprio usuário',
                ]} />
            </Section>

            <Section id="seus-direitos" title="6. Seus Direitos (LGPD)">
                <P>Nos termos da LGPD, você tem os seguintes direitos em relação aos seus dados pessoais:</P>
                <BulletList items={[
                    'Confirmação de existência de tratamento',
                    'Acesso aos dados que mantemos sobre você',
                    'Correção de dados incompletos, inexatos ou desatualizados',
                    'Anonimização, bloqueio ou eliminação de dados desnecessários',
                    'Portabilidade dos dados a outro fornecedor de serviço',
                    'Eliminação dos dados tratados com seu consentimento',
                    'Informação sobre com quem compartilhamos seus dados',
                    'Revogação do consentimento a qualquer momento',
                ]} />
                <HighlightBox icon="📧">
                    Para exercer qualquer desses direitos, envie solicitação para marciogholmm@gmail.com.
                    Respondemos em até 15 dias úteis.
                </HighlightBox>
            </Section>

            <Section id="cookies" title="7. Cookies">
                <P>A plataforma utiliza cookies para:</P>
                <BulletList items={[
                    'Manter sua sessão autenticada',
                    'Memorizar preferências de uso',
                    'Analisar o desempenho e uso da plataforma (analytics)',
                ]} />
                <P>Você pode configurar seu navegador para recusar cookies, mas isso pode afetar o funcionamento de algumas funcionalidades.</P>
            </Section>

            <Section id="seguranca" title="8. Segurança">
                <BulletList items={[
                    'Criptografia de dados em trânsito (HTTPS/TLS)',
                    'Senhas armazenadas com hash seguro (bcrypt)',
                    'Tokens de autenticação com expiração e rotação',
                    'Controle de acesso baseado em funções (RBAC)',
                    'Backups regulares com retenção segura',
                    'Monitoramento contínuo de acessos e anomalias',
                ]} />
            </Section>

            <Section id="menores" title="9. Menores de Idade">
                <P>
                    O Northway Omni é destinado exclusivamente a empresas e profissionais maiores de 18 anos.
                    Não coletamos intencionalmente dados de menores de idade. Caso identificados, os excluiremos imediatamente.
                </P>
            </Section>

            <Section id="alteracoes" title="10. Alterações nesta Política">
                <P>
                    Podemos atualizar esta Política periodicamente. Alterações relevantes serão comunicadas
                    por e-mail ou aviso na plataforma com antecedência mínima de 15 dias.
                </P>
            </Section>

            <Section id="contato" title="11. Contato">
                <BulletList items={[
                    'E-mail: marciogholmm@gmail.com',
                    'Empresa: NorthWay Company',
                    'CNPJ: 56.106.629/0001-75',
                    'Site: https://omni.northwaycompany.com.br',
                ]} />
            </Section>
        </LegalLayout>
    );
}
