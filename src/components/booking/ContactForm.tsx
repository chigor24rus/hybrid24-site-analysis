import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface Model {
  id: number;
  brand_id: number;
  name: string;
  year_range?: string;
}

interface ContactFormProps {
  name: string;
  phone: string;
  email: string;
  brand: string;
  model: string;
  plateNumber: string;
  vin: string;
  comment: string;
  brands: Brand[];
  models: Model[];
  loadingBrands: boolean;
  agreedToTerms: boolean;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onPlateNumberChange: (value: string) => void;
  onVinChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  onAgreedToTermsChange: (value: boolean) => void;
}

const ContactForm = ({
  name,
  phone,
  email,
  brand,
  model,
  plateNumber,
  vin,
  comment,
  brands,
  models,
  loadingBrands,
  agreedToTerms,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  onBrandChange,
  onModelChange,
  onPlateNumberChange,
  onVinChange,
  onCommentChange,
  onAgreedToTermsChange
}: ContactFormProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Ваше имя</Label>
        <Input
          id="name"
          placeholder="Иван Иванов"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Телефон *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+7 (999) 123-45-67"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="ivan@example.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Марка авто</Label>
          <Select value={brand} onValueChange={onBrandChange} disabled={loadingBrands}>
            <SelectTrigger>
              <SelectValue placeholder={loadingBrands ? "Загрузка..." : "Выберите бренд"} />
            </SelectTrigger>
            <SelectContent>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id.toString()}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Модель</Label>
          <Select value={model} onValueChange={onModelChange} disabled={!brand || models.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder={!brand ? "Сначала выберите бренд" : models.length === 0 ? "Нет моделей" : "Выберите модель"} />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m.id} value={m.id.toString()}>
                  {m.name} {m.year_range && `(${m.year_range})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="plateNumber">Гос.Номер (желательно)</Label>
          <Input
            id="plateNumber"
            placeholder="А123БВ777"
            value={plateNumber}
            onChange={(e) => onPlateNumberChange(e.target.value.toUpperCase())}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vin">VIN / Номер кузова (желательно)</Label>
          <Input
            id="vin"
            placeholder="XTA123456789"
            value={vin}
            onChange={(e) => onVinChange(e.target.value.toUpperCase())}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Комментарий (необязательно)</Label>
        <Textarea
          id="comment"
          placeholder="Дополнительная информация..."
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
        />
      </div>

      <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-border">
        <input
          type="checkbox"
          id="terms"
          checked={agreedToTerms}
          onChange={(e) => onAgreedToTermsChange(e.target.checked)}
          className="mt-1 w-4 h-4 accent-primary cursor-pointer"
        />
        <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
          Я согласен с условиями записи и даю согласие на обработку персональных данных. Понимаю, что запись будет подтверждена обратным звонком мастера-консультанта.
        </label>
      </div>
    </>
  );
};

export default ContactForm;