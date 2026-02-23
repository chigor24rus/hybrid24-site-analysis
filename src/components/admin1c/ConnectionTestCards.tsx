import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import TestResultBlock, { TestResult } from './TestResultBlock';

interface ConnectionTestCardsProps {
  loading: boolean;
  connectionResult: TestResult | null;
  metadataResult: TestResult | null;
  servicesResult: TestResult | null;
  schemaResult: TestResult | null;
  readDocResult: TestResult | null;
  readOrgResult: TestResult | null;
  readZnResult: TestResult | null;
  readSvodZnResult: TestResult | null;
  onTestConnection: () => void;
  onTestMetadata: () => void;
  onTestServices: () => void;
  onTestSchema: () => void;
  onTestReadDoc: () => void;
  onTestReadOrg: () => void;
  onTestReadZn: () => void;
  onTestReadSvodZn: () => void;
}

const ConnectionTestCards = ({
  loading,
  connectionResult,
  metadataResult,
  servicesResult,
  schemaResult,
  readDocResult,
  readOrgResult,
  readZnResult,
  readSvodZnResult,
  onTestConnection,
  onTestMetadata,
  onTestServices,
  onTestSchema,
  onTestReadDoc,
  onTestReadOrg,
  onTestReadZn,
  onTestReadSvodZn,
}: ConnectionTestCardsProps) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Plug" size={20} />
            Проверка подключения
          </CardTitle>
          <CardDescription>
            Базовая проверка доступности 1С через OData
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onTestConnection} disabled={loading} className="w-full">
            {loading ? <Icon name="Loader" className="mr-2 animate-spin" size={18} /> : <Icon name="Play" className="mr-2" size={18} />}
            Проверить подключение
          </Button>
          <TestResultBlock result={connectionResult} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Database" size={20} />
            Метаданные
          </CardTitle>
          <CardDescription>
            Получить список доступных сущностей из 1С
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onTestMetadata} disabled={loading} className="w-full">
            {loading ? <Icon name="Loader" className="mr-2 animate-spin" size={18} /> : <Icon name="Play" className="mr-2" size={18} />}
            Получить метаданные
          </Button>
          <TestResultBlock result={metadataResult} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="List" size={20} />
            Список услуг
          </CardTitle>
          <CardDescription>
            Получить каталог услуг из 1С
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onTestServices} disabled={loading} className="w-full">
            {loading ? <Icon name="Loader" className="mr-2 animate-spin" size={18} /> : <Icon name="Play" className="mr-2" size={18} />}
            Получить услуги
          </Button>
          <TestResultBlock result={servicesResult} />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="FileSearch" size={20} />
            Схема Document_ЗаявкаНаРемонт
          </CardTitle>
          <CardDescription>
            Получить реальные поля документа заявки на ремонт из 1С
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onTestSchema} disabled={loading} className="w-full" variant="outline">
            {loading ? <Icon name="Loader" className="mr-2 animate-spin" size={18} /> : <Icon name="Play" className="mr-2" size={18} />}
            Получить поля документа
          </Button>
          <TestResultBlock result={schemaResult} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="FileText" size={20} />
            Читать заявку из 1С
          </CardTitle>
          <CardDescription>
            Получить первый документ ЗаявкаНаРемонт — видны реальные поля и GUID
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onTestReadDoc} disabled={loading} className="w-full" variant="outline">
            {loading ? <Icon name="Loader" className="mr-2 animate-spin" size={18} /> : <Icon name="Download" className="mr-2" size={18} />}
            Читать документ
          </Button>
          <TestResultBlock result={readDocResult} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Building2" size={20} />
            Список организаций
          </CardTitle>
          <CardDescription>
            Получить GUID организаций из 1С для подстановки в заявку
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onTestReadOrg} disabled={loading} className="w-full" variant="outline">
            {loading ? <Icon name="Loader" className="mr-2 animate-spin" size={18} /> : <Icon name="Download" className="mr-2" size={18} />}
            Получить организации
          </Button>
          <TestResultBlock result={readOrgResult} />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Car" size={20} />
            Первый проведённый ЗаказНаряд (с автомобилями)
          </CardTitle>
          <CardDescription>
            Получить первый закрытый ЗаказНаряд — видны реальные поля и expand Автомобили. Можно передать kontragent_key через URL (?kontragent_key=...) для фильтрации по клиенту.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onTestReadZn} disabled={loading} className="w-full" variant="outline">
            {loading ? <Icon name="Loader" className="mr-2 animate-spin" size={18} /> : <Icon name="Download" className="mr-2" size={18} />}
            Получить ЗаказНаряд с автомобилями
          </Button>
          <TestResultBlock result={readZnResult} />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="FolderOpen" size={20} />
            СводныйРемонтныйЗаказ (автомобиль клиента)
          </CardTitle>
          <CardDescription>
            Читает СводныйРемонтныйЗаказ из первого ЗаказНаряда — именно там может быть привязан автомобиль
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onTestReadSvodZn} disabled={loading} className="w-full" variant="outline">
            {loading ? <Icon name="Loader" className="mr-2 animate-spin" size={18} /> : <Icon name="Download" className="mr-2" size={18} />}
            Читать СводныйРемонтныйЗаказ
          </Button>
          <TestResultBlock result={readSvodZnResult} />
        </CardContent>
      </Card>
    </>
  );
};

export default ConnectionTestCards;