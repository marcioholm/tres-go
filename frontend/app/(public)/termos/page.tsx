import { Metadata } from 'next';
import {
    LegalLayout, Section, SubSection, P, BulletList, HighlightBox
} from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
    title: 'Termos de Serviço — NorthWay Omni',
    description: 'Termos e condições de uso da plataforma NorthWay Omni.',
    robots: { index: true, follow: true },
};

export default function TermosPage() {
    return (
        <LegalLayout
            title="Termos de Serviço"
            subtitle="Condições de uso da plataforma NorthWay Omni"
            version="1.0"
            updatedAt="20 de fevereiro de 2026"
        >
            <Section id="aceitacao" title="1. Aceitação dos Termos">
                <P>
                    Ao criar uma conta, acessar ou utilizar a plataforma Northway Omni ("Plataforma"),
                    operada pela NorthWay Company, CNPJ 56.106.629/0001-75 ("nós", "Empresa"), você
                    ("Usuário" ou "Cliente") concorda integralmente com estes Termos de Serviço. Se você
                    não concordar com qualquer disposição, não utilize a Plataforma.
                </P>
            </Section>

            <Section id="servico" title="2. Descrição do Serviço">
                <P>O Northway Omni é uma plataforma SaaS de atendimento omnichannel que permite:</P>
                <BulletList items={[
                    'Centralização de conversas de WhatsApp, Instagram, Messenger e outros canais em um único inbox',
                    'Gestão de atendimento com setores, filas e agentes',
                    'CRM integrado com pipeline de vendas e kanban',
                    'Disparo de campanhas e mensagens em massa',
                    'Automação de atendimento com chatbots e regras',
                    'Relatórios e métricas de desempenho',
                    'Integração com APIs externas via webhooks',
                ]} />
            </Section>

            <Section id="cadastro" title="3. Cadastro e Conta">
                <SubSection title="3.1 Elegibilidade">
                    <P>Para utilizar a Plataforma, você deve: ter pelo menos 18 anos; ter capacidade legal para celebrar contratos; fornecer informações verdadeiras e precisas durante o cadastro.</P>
                </SubSection>
                <SubSection title="3.2 Responsabilidade da conta">
                    <P>Você é responsável por manter a confidencialidade de suas credenciais e por todas as atividades realizadas em sua conta. Notifique imediatamente qualquer uso não autorizado pelo e-mail marciogholmm@gmail.com.</P>
                </SubSection>
                <SubSection title="3.3 Workspace e multiusuário">
                    <P>Cada conta possui um workspace isolado. O administrador do workspace é responsável pela gestão dos agentes e pelo uso que fazem da Plataforma dentro do plano contratado.</P>
                </SubSection>
            </Section>

            <Section id="pagamento" title="4. Planos, Preços e Pagamento">
                <SubSection title="4.1 Período de teste gratuito">
                    <P>Novos workspaces têm 14 (quatorze) dias de teste gratuito com acesso às funcionalidades do plano contratado, sem necessidade de cartão de crédito.</P>
                </SubSection>
                <SubSection title="4.2 Cobrança">
                    <P>As cobranças são realizadas mensalmente ou anualmente via boleto bancário, PIX ou cartão de crédito, processados pela plataforma Asaas.</P>
                </SubSection>
                <SubSection title="4.3 Inadimplência">
                    <BulletList items={[
                        'Dia 1 após vencimento: status "Em atraso" — plataforma continua funcionando com aviso de cobrança',
                        'Dia 5 após vencimento: bloqueio automático do workspace até regularização do pagamento',
                        'Após pagamento confirmado: desbloqueio automático em até 1 hora',
                    ]} />
                </SubSection>
                <SubSection title="4.4 Cancelamento e reembolso">
                    <P>Você pode cancelar a qualquer momento pelo painel. Não há reembolso proporcional de períodos já pagos, exceto nos casos previstos pelo Código de Defesa do Consumidor (CDC). Seus dados ficam disponíveis por 30 dias após o cancelamento para exportação.</P>
                </SubSection>
            </Section>

            <Section id="uso-aceitavel" title="5. Uso Aceitável">
                <P>Você se compromete a NÃO utilizar a Plataforma para:</P>
                <BulletList items={[
                    'Enviar spam, mensagens não solicitadas ou comunicações em massa sem consentimento dos destinatários',
                    'Violar as políticas de uso das APIs da Meta (WhatsApp, Instagram, Messenger)',
                    'Praticar atividades ilegais, fraudulentas ou que violem direitos de terceiros',
                    'Distribuir malware, vírus ou qualquer código malicioso',
                    'Coletar dados de usuários sem seu consentimento expresso',
                    'Revender ou sublicenciar o acesso à Plataforma sem autorização expressa da NorthWay Company',
                    'Realizar engenharia reversa, descompilar ou tentar extrair o código-fonte',
                    'Sobrecarregar deliberadamente a infraestrutura da Plataforma',
                ]} />
                <HighlightBox icon="⚠️">
                    O descumprimento pode resultar em suspensão imediata da conta sem direito a reembolso
                    e responsabilização civil e criminal pelos danos causados.
                </HighlightBox>
            </Section>

            <Section id="integracoes" title="6. Integrações com Terceiros">
                <P>A Plataforma integra-se com serviços de terceiros (Meta, operadoras de WhatsApp Business API, etc.). O uso dessas integrações está sujeito também aos termos e políticas dos respectivos fornecedores. A NorthWay Company não se responsabiliza por alterações, interrupções ou descontinuação de APIs de terceiros que afetem funcionalidades da Plataforma.</P>
            </Section>

            <Section id="propriedade" title="7. Propriedade Intelectual">
                <SubSection title="7.1 Nossa propriedade">
                    <P>Todo o código, design, marca, logotipo, algoritmos e tecnologia da plataforma Northway Omni são de propriedade exclusiva da NorthWay Company e protegidos pela legislação de propriedade intelectual brasileira.</P>
                </SubSection>
                <SubSection title="7.2 Seus dados">
                    <P>Você mantém plena propriedade sobre os dados que insere na Plataforma. Ao utilizar o serviço, você nos concede licença limitada para processar esses dados exclusivamente para a prestação do serviço contratado.</P>
                </SubSection>
            </Section>

            <Section id="disponibilidade" title="8. Disponibilidade e SLA">
                <P>Nos comprometemos a manter a Plataforma disponível com meta de 99,5% de uptime mensal, excluídos:</P>
                <BulletList items={[
                    'Manutenções programadas (comunicadas com antecedência mínima de 48h)',
                    'Eventos de força maior',
                    'Indisponibilidades de serviços de terceiros (Meta APIs, operadoras, etc.)',
                ]} />
            </Section>

            <Section id="responsabilidade" title="9. Limitação de Responsabilidade">
                <P>Na extensão máxima permitida pela lei, a NorthWay Company não será responsável por danos indiretos, incidentais ou consequentes. Nossa responsabilidade total está limitada ao valor pago pelo usuário nos últimos 3 (três) meses de serviço.</P>
            </Section>

            <Section id="privacidade" title="10. Privacidade">
                <P>
                    O tratamento de dados pessoais é regido por nossa{' '}
                    <a href="/privacidade" className="text-[#ff1f4b] hover:underline">
                        Política de Privacidade
                    </a>
                    , disponível em omni.northwaycompany.com.br/privacidade, que é parte integrante destes Termos.
                </P>
            </Section>

            <Section id="rescisao" title="11. Rescisão">
                <P>Qualquer das partes pode rescindir o contrato a qualquer momento. Rescindiremos imediatamente, sem aviso, em caso de violação grave destes Termos. Em caso de rescisão, você terá 30 dias para exportar seus dados antes da exclusão definitiva.</P>
            </Section>

            <Section id="alteracoes" title="12. Alterações nos Termos">
                <P>Alterações relevantes serão comunicadas por e-mail e/ou aviso na Plataforma com antecedência mínima de 15 (quinze) dias. O uso continuado após a vigência representa aceite das novas condições.</P>
            </Section>

            <Section id="lei" title="13. Lei Aplicável e Foro">
                <P>
                    Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o
                    foro da Comarca de Arapoti, Estado do Paraná, para dirimir quaisquer controvérsias
                    decorrentes destes Termos, com renúncia expressa a qualquer outro, por mais privilegiado
                    que seja.
                </P>
            </Section>

            <Section id="contato" title="14. Contato">
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
