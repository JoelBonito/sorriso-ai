import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Save, RotateCcw, DollarSign, Info, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { saveConfig, getConfig, DEFAULT_PROMPT, type Config } from "@/utils/storage";
import { Switch } from "@/components/ui/switch";
import { useConfig } from "@/contexts/ConfigContext";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
export default function ConfigForm() {
  const navigate = useNavigate();
  const {
    refreshConfig
  } = useConfig();
  const [showApiKey, setShowApiKey] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formData, setFormData] = useState<Config>({
    apiKey: "",
    backendUrl: import.meta.env.VITE_SUPABASE_URL || "",
    temperature: 0.4,
    topK: 32,
    topP: 1.0,
    maxTokens: 8192,
    promptTemplate: DEFAULT_PROMPT,
    userName: "",
    userPhone: "",
    userEmail: "",
    clinicName: "",
    clinicAddress: "",
    clinicPhone: "",
    clinicEmail: "",
    clinicCnpj: "",
    clinicDentistName: "",
    clinicCro: "",
    clinicLogoUrl: "",
    clinicZipCode: "",
    clinicCity: "",
    clinicState: "",
    paymentConfig: {
      discount_cash: 10,
      discount_pix: 5,
      max_installments: 12,
      allow_credit_card: true,
      allow_debit_card: true,
      allow_boleto: true
    },
    crmEnabled: true,
    facetsSimulatorEnabled: true,
    whiteningSimulatorEnabled: true
  });
  useEffect(() => {
    getConfig().then(config => {
      if (config) {
        setFormData(config);
      }
    });
  }, []);
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.apiKey || formData.apiKey.length < 20) {
      newErrors.apiKey = "API Key inválida (mínimo 20 caracteres)";
    }
    if (!formData.backendUrl) {
      newErrors.backendUrl = "URL do backend é obrigatória";
    } else {
      try {
        new URL(formData.backendUrl);
      } catch {
        newErrors.backendUrl = "URL inválida";
      }
    }
    if (formData.temperature < 0 || formData.temperature > 1) {
      newErrors.temperature = "Temperature deve estar entre 0 e 1";
    }
    if (formData.topK <= 0) {
      newErrors.topK = "Top K deve ser maior que 0";
    }
    if (formData.topP < 0 || formData.topP > 1) {
      newErrors.topP = "Top P deve estar entre 0 e 1";
    }
    if (formData.maxTokens <= 0) {
      newErrors.maxTokens = "Max Tokens deve ser maior que 0";
    }
    if (!formData.promptTemplate.trim()) {
      newErrors.promptTemplate = "Template do prompt é obrigatório";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }
    const config: Config = {
      apiKey: formData.apiKey,
      backendUrl: formData.backendUrl,
      temperature: formData.temperature,
      topK: formData.topK,
      topP: formData.topP,
      maxTokens: formData.maxTokens,
      promptTemplate: formData.promptTemplate,
      userName: formData.userName,
      userPhone: formData.userPhone,
      userEmail: formData.userEmail,
      clinicName: formData.clinicName,
      clinicAddress: formData.clinicAddress,
      clinicPhone: formData.clinicPhone,
      clinicEmail: formData.clinicEmail,
      clinicCnpj: formData.clinicCnpj,
      clinicDentistName: formData.clinicDentistName,
      clinicCro: formData.clinicCro,
      clinicLogoUrl: formData.clinicLogoUrl,
      clinicZipCode: formData.clinicZipCode,
      clinicCity: formData.clinicCity,
      clinicState: formData.clinicState,
      paymentConfig: formData.paymentConfig,
      crmEnabled: formData.crmEnabled,
      facetsSimulatorEnabled: formData.facetsSimulatorEnabled,
      whiteningSimulatorEnabled: formData.whiteningSimulatorEnabled
    };
    try {
      await saveConfig(config);
      await refreshConfig(); // Atualizar contexto
      toast.success("Configuração salva com sucesso!");
      setTimeout(() => navigate("/"), 500);
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar configuração");
    }
  };
  const handleResetPrompt = () => {
    setFormData({
      ...formData,
      promptTemplate: DEFAULT_PROMPT
    });
    toast.info("Prompt restaurado para o padrão");
  };
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB');
      return;
    }
    setUploadingLogo(true);
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Remover logo anterior se existir
      if (formData.clinicLogoUrl) {
        const oldPath = formData.clinicLogoUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('clinic-logos').remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload da nova logo
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      const {
        error: uploadError
      } = await supabase.storage.from('clinic-logos').upload(filePath, file, {
        upsert: true
      });
      if (uploadError) throw uploadError;

      // Obter URL pública
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from('clinic-logos').getPublicUrl(filePath);
      setFormData({
        ...formData,
        clinicLogoUrl: publicUrl
      });
      toast.success('Logomarca carregada com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer upload da logomarca');
    } finally {
      setUploadingLogo(false);
    }
  };
  const handleRemoveLogo = async () => {
    if (!formData.clinicLogoUrl) return;
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      const oldPath = formData.clinicLogoUrl.split('/').pop();
      if (oldPath) {
        await supabase.storage.from('clinic-logos').remove([`${user.id}/${oldPath}`]);
      }
      setFormData({
        ...formData,
        clinicLogoUrl: undefined
      });
      toast.success('Logomarca removida');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover logomarca');
    }
  };
  return <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      {/* DADOS DO USUÁRIO */}
      <div className="border bg-card shadow-sm p-6 space-y-4 rounded-lg">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          👤 Dados do Usuário
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="userName">Nome Completo</Label>
            <Input id="userName" type="text" placeholder="Seu nome completo" value={formData.userName || ''} onChange={e => setFormData({
            ...formData,
            userName: e.target.value
          })} />
            <p className="text-xs text-muted-foreground">
              Este nome aparecerá na barra lateral
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="userPhone">Telefone</Label>
            <Input id="userPhone" type="tel" placeholder="(00) 00000-0000" value={formData.userPhone || ''} onChange={e => setFormData({
            ...formData,
            userPhone: e.target.value
          })} />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="userEmail">E-mail</Label>
            <Input id="userEmail" type="email" placeholder="seu@email.com" value={formData.userEmail || ''} onChange={e => setFormData({
            ...formData,
            userEmail: e.target.value
          })} />
          </div>
        </div>
      </div>

      {/* DADOS DA CLÍNICA */}
      <div className="rounded-lg border bg-card shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          🏥 Dados da Clínica/Consultório
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Logomarca */}
          <div className="space-y-2 md:col-span-2">
            <Label>Logomarca da Clínica</Label>
            <div className="flex items-center gap-4">
              {formData.clinicLogoUrl ? <div className="relative">
                  <img src={formData.clinicLogoUrl} alt="Logo da clínica" className="h-20 w-auto object-contain rounded border p-2" />
                  <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6" onClick={handleRemoveLogo}>
                    <X className="h-3 w-3" />
                  </Button>
                </div> : <div className="h-20 w-20 border-2 border-dashed rounded flex items-center justify-center text-muted-foreground">
                  <Upload className="h-6 w-6" />
                </div>}
              <div className="flex-1">
                <Input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} className="cursor-pointer" />
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG ou WEBP (máx. 2MB)
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="clinicName">Nome da Clínica</Label>
            <Input id="clinicName" type="text" placeholder="Nome do seu consultório ou clínica" value={formData.clinicName || ''} onChange={e => setFormData({
            ...formData,
            clinicName: e.target.value
          })} />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="clinicAddress">Endereço</Label>
            <Input id="clinicAddress" type="text" placeholder="Rua, número, bairro" value={formData.clinicAddress || ''} onChange={e => setFormData({
            ...formData,
            clinicAddress: e.target.value
          })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicZipCode">CEP</Label>
            <Input id="clinicZipCode" type="text" placeholder="00000-000" value={formData.clinicZipCode || ''} onChange={e => setFormData({
            ...formData,
            clinicZipCode: e.target.value
          })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicCity">Cidade</Label>
            <Input id="clinicCity" type="text" placeholder="São Paulo" value={formData.clinicCity || ''} onChange={e => setFormData({
            ...formData,
            clinicCity: e.target.value
          })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicState">Estado</Label>
            <Select value={formData.clinicState || ''} onValueChange={value => setFormData({
            ...formData,
            clinicState: value
          })}>
              <SelectTrigger id="clinicState">
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AC">Acre - AC</SelectItem>
                <SelectItem value="AL">Alagoas - AL</SelectItem>
                <SelectItem value="AP">Amapá - AP</SelectItem>
                <SelectItem value="AM">Amazonas - AM</SelectItem>
                <SelectItem value="BA">Bahia - BA</SelectItem>
                <SelectItem value="CE">Ceará - CE</SelectItem>
                <SelectItem value="DF">Distrito Federal - DF</SelectItem>
                <SelectItem value="ES">Espírito Santo - ES</SelectItem>
                <SelectItem value="GO">Goiás - GO</SelectItem>
                <SelectItem value="MA">Maranhão - MA</SelectItem>
                <SelectItem value="MT">Mato Grosso - MT</SelectItem>
                <SelectItem value="MS">Mato Grosso do Sul - MS</SelectItem>
                <SelectItem value="MG">Minas Gerais - MG</SelectItem>
                <SelectItem value="PA">Pará - PA</SelectItem>
                <SelectItem value="PB">Paraíba - PB</SelectItem>
                <SelectItem value="PR">Paraná - PR</SelectItem>
                <SelectItem value="PE">Pernambuco - PE</SelectItem>
                <SelectItem value="PI">Piauí - PI</SelectItem>
                <SelectItem value="RJ">Rio de Janeiro - RJ</SelectItem>
                <SelectItem value="RN">Rio Grande do Norte - RN</SelectItem>
                <SelectItem value="RS">Rio Grande do Sul - RS</SelectItem>
                <SelectItem value="RO">Rondônia - RO</SelectItem>
                <SelectItem value="RR">Roraima - RR</SelectItem>
                <SelectItem value="SC">Santa Catarina - SC</SelectItem>
                <SelectItem value="SP">São Paulo - SP</SelectItem>
                <SelectItem value="SE">Sergipe - SE</SelectItem>
                <SelectItem value="TO">Tocantins - TO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicPhone">Telefone</Label>
            <Input id="clinicPhone" type="tel" placeholder="(00) 0000-0000" value={formData.clinicPhone || ''} onChange={e => setFormData({
            ...formData,
            clinicPhone: e.target.value
          })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicEmail">E-mail</Label>
            <Input id="clinicEmail" type="email" placeholder="contato@clinica.com" value={formData.clinicEmail || ''} onChange={e => setFormData({
            ...formData,
            clinicEmail: e.target.value
          })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicCnpj">CNPJ</Label>
            <Input id="clinicCnpj" type="text" placeholder="00.000.000/0000-00" value={formData.clinicCnpj || ''} onChange={e => setFormData({
            ...formData,
            clinicCnpj: e.target.value
          })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicDentistName">Nome do Responsável Técnico</Label>
            <Input id="clinicDentistName" type="text" placeholder="Dr(a). Nome Completo" value={formData.clinicDentistName || ''} onChange={e => setFormData({
            ...formData,
            clinicDentistName: e.target.value
          })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicCro">CRO</Label>
            <Input id="clinicCro" type="text" placeholder="CRO-SP 12345" value={formData.clinicCro || ''} onChange={e => setFormData({
            ...formData,
            clinicCro: e.target.value
          })} />
          </div>
        </div>
      </div>

      {/* CONDIÇÕES DE PAGAMENTO */}
      <div className="rounded-lg border bg-card shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          💳 Condições de Pagamento
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure os descontos e condições de pagamento padrão que serão aplicados nos orçamentos
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="discountCash">Desconto à Vista (Dinheiro) %</Label>
            <Input
              id="discountCash"
              type="number"
              min="0"
              max="100"
              step="1"
              placeholder="10"
              value={formData.paymentConfig?.discount_cash || 0}
              onChange={e => setFormData({
                ...formData,
                paymentConfig: {
                  ...formData.paymentConfig!,
                  discount_cash: parseFloat(e.target.value) || 0
                }
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountPix">Desconto PIX %</Label>
            <Input
              id="discountPix"
              type="number"
              min="0"
              max="100"
              step="1"
              placeholder="5"
              value={formData.paymentConfig?.discount_pix || 0}
              onChange={e => setFormData({
                ...formData,
                paymentConfig: {
                  ...formData.paymentConfig!,
                  discount_pix: parseFloat(e.target.value) || 0
                }
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxInstallments">Parcelas Máximas</Label>
            <Input
              id="maxInstallments"
              type="number"
              min="1"
              max="48"
              step="1"
              placeholder="12"
              value={formData.paymentConfig?.max_installments || 12}
              onChange={e => setFormData({
                ...formData,
                paymentConfig: {
                  ...formData.paymentConfig!,
                  max_installments: parseInt(e.target.value) || 12
                }
              })}
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Label className="text-base">Formas de Pagamento Aceitas</Label>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label htmlFor="allowCreditCard" className="text-sm font-medium">Cartão de Crédito</Label>
              <p className="text-xs text-muted-foreground">Aceitar pagamento com cartão de crédito</p>
            </div>
            <Switch
              id="allowCreditCard"
              checked={formData.paymentConfig?.allow_credit_card ?? true}
              onCheckedChange={checked => setFormData({
                ...formData,
                paymentConfig: {
                  ...formData.paymentConfig!,
                  allow_credit_card: checked
                }
              })}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label htmlFor="allowDebitCard" className="text-sm font-medium">Cartão de Débito</Label>
              <p className="text-xs text-muted-foreground">Aceitar pagamento com cartão de débito</p>
            </div>
            <Switch
              id="allowDebitCard"
              checked={formData.paymentConfig?.allow_debit_card ?? true}
              onCheckedChange={checked => setFormData({
                ...formData,
                paymentConfig: {
                  ...formData.paymentConfig!,
                  allow_debit_card: checked
                }
              })}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label htmlFor="allowBoleto" className="text-sm font-medium">Boleto Bancário</Label>
              <p className="text-xs text-muted-foreground">Aceitar pagamento com boleto</p>
            </div>
            <Switch
              id="allowBoleto"
              checked={formData.paymentConfig?.allow_boleto ?? true}
              onCheckedChange={checked => setFormData({
                ...formData,
                paymentConfig: {
                  ...formData.paymentConfig!,
                  allow_boleto: checked
                }
              })}
            />
          </div>
        </div>
      </div>

      {/* CREDENCIAIS */}


      {/* PARÂMETROS AVANÇADOS */}


      {/* MÓDULOS DO SISTEMA */}
      <div className="rounded-lg border bg-card shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          📊 Módulos do Sistema
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="crmEnabled" className="text-base font-semibold">
                    Módulo CRM
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Sistema de gestão de relacionamento com clientes. 
                          Gerencie leads, oportunidades e pipeline de vendas.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ativar ou desativar o módulo de gestão de leads
                </p>
              </div>
            </div>
            <Switch id="crmEnabled" checked={formData.crmEnabled} onCheckedChange={async checked => {
            const updatedData = {
              ...formData,
              crmEnabled: checked
            };
            setFormData(updatedData);
            try {
              await saveConfig(updatedData);
              await refreshConfig();
              toast.success(checked ? "Módulo CRM ativado" : "Módulo CRM desativado");
            } catch (error: any) {
              toast.error("Erro ao salvar configuração");
              setFormData(formData); // Reverter em caso de erro
            }
          }} />
          </div>
        </div>
      </div>

      {/* MÓDULOS DE SIMULAÇÃO */}
      <div className="rounded-lg border bg-card shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          🦷 Módulos de Simulação
        </h2>
        
        <div className="space-y-4">
          {/* Facetas (AGORA COM TOGGLE) */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="facetsEnabled" className="text-base font-semibold">
                    Simulador de Facetas Dentárias
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Módulo principal de simulação de facetas dentárias.
                          {!formData.whiteningSimulatorEnabled && " Não pode ser desativado quando Clareamento está desativado."}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">
                  Simulação de facetas de cerâmica (ativo por padrão)
                  {!formData.whiteningSimulatorEnabled && " - Bloqueado: Clareamento desativado"}
                </p>
              </div>
            </div>
            <Switch id="facetsEnabled" checked={formData.facetsSimulatorEnabled ?? true} disabled={!formData.whiteningSimulatorEnabled} onCheckedChange={async checked => {
            const updatedData = {
              ...formData,
              facetsSimulatorEnabled: checked
            };
            setFormData(updatedData);
            try {
              await saveConfig(updatedData);
              await refreshConfig();
              toast.success(checked ? "Simulador de Facetas ativado" : "Simulador de Facetas desativado");
            } catch (error: any) {
              toast.error("Erro ao salvar configuração");
              setFormData(formData);
            }
          }} />
          </div>
          
          {/* Clareamento (toggle) */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="whiteningEnabled" className="text-base font-semibold">
                    Simulador de Clareamento Dental
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Simulação de clareamento dental. Útil para apresentar 
                          resultados de tratamentos de branqueamento.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ative para permitir simulações de clareamento dental
                </p>
              </div>
            </div>
            <Switch id="whiteningEnabled" checked={formData.whiteningSimulatorEnabled ?? true} onCheckedChange={async checked => {
            // Se desativar Clareamento, Facetas deve ser ativado automaticamente
            const updatedData = {
              ...formData,
              whiteningSimulatorEnabled: checked,
              facetsSimulatorEnabled: checked ? formData.facetsSimulatorEnabled : true
            };
            setFormData(updatedData);
            try {
              await saveConfig(updatedData);
              await refreshConfig();
              if (!checked && !formData.facetsSimulatorEnabled) {
                toast.success("Simulador de Clareamento desativado. Facetas foi ativado automaticamente.");
              } else {
                toast.success(checked ? "Simulador de Clareamento ativado" : "Simulador de Clareamento desativado");
              }
            } catch (error: any) {
              toast.error("Erro ao salvar configuração");
              setFormData(formData);
            }
          }} />
          </div>
        </div>
      </div>

      {/* INFORMATIVO - SERVIÇOS AGORA GERIDOS EM ABA PRÓPRIA */}
      

      <div className="flex justify-end gap-3 pb-6">
          <Button type="submit" className="flex items-center gap-2 bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4" />
            Salvar Configuração
          </Button>
      </div>
    </form>;
}