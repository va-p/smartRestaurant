import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView
} from 'react-native';
import {
  Container,
  Upload,
  PickImageButton,
  Form,
  Label,
  InputGroup,
  InputGroupHeader,
  MaxCharacters
} from './styles';

import { useNavigation, useRoute } from '@react-navigation/native';
import { yupResolver } from '@hookform/resolvers/yup';
import * as ImagePicker from 'expo-image-picker';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { ProductNavigationProps } from 'src/@types/navigation';

import { InputCategory } from '@components/Form/InputCategory';
import { InputPrice } from '@components/Form/InputPrice';
import { ProductImage } from '@components/ProductImage';
import { InputForm } from '@components/Form/InputForm';
import { Button } from '@components/Button';

import api from '@api/api';
import { Header } from '@components/Header';

type FormData = {
  name: string;
  description: string;
  category: string;
  image: string;
  priceSizeP: number;
  priceSizeM: number;
  priceSizeG: number;
  priceSizeGG: number;
}

/* Validation Form - Start */
const schema = Yup.object().shape({
  name: Yup.string().required('Digite o nome do produto'),
  description: Yup.string().required('Digite a descrição do produto'),
  category: Yup.string().required('Selecione a categoria do produto'),
  priceSizeP: Yup.number().required('Digite o valor do produto').typeError('Digite apenas números'),
  priceSizeM: Yup.number().required('Digite o valor do produto').typeError('Digite apenas números'),
  priceSizeG: Yup.number().required('Digite o valor do produto').typeError('Digite apenas números'),
  priceSizeGG: Yup.number().required('Digite o valor do produto').typeError('Digite apenas números'),
});
/* Validation Form - End */

export function RegisterProduct() {
  const { control, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });
  const [productImage, setProductImage] = useState('');
  const [categories, setCategories] = useState([]);
  const [productCategory, setProductCategory] = useState('');
  const [product, setProduct] = useState();
  const [loading, setLoading] = useState(false);
  const [buttonIsLoading, setButtonIsLoading] = useState(false);

  const route = useRoute();
  const { id } = route.params as ProductNavigationProps;

  async function fetchProductCategories() {
    setLoading(true);
    try {
      const { data } = await api.get('product_category');
      if (!data) {
      } else {
        setCategories(data);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  async function handlePickerImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === 'granted') {
      const response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [4, 4]
      });

      if (!response.cancelled) {
        setProductImage(response.uri);
      }
    } else {
      Alert.alert('Permissão de acesso à biblioteca de mídia negada.')
    }
  };

  async function handleAddProduct(form: FormData) {
    setButtonIsLoading(true);
    try {
      const newProductImage = {
        image: productImage
      }
      const productImageDataResponse = await api.post('product_image', newProductImage);
      if (productImageDataResponse.status === 200) {
      } else {
        Alert.alert('Erro ao fazer upload da imagem do produto. Tente novamente em alguns instantes.')
      }

      const newProduct = {
        name: form.name,
        description: form.description,
        category: form.category,
        product_image_id: productImageDataResponse.data.id
      }
      const productDataResponse = await api.post('product', newProduct);
      if (productDataResponse.status === 200) {
        Alert.alert('Cadastro de Produto', 'Produto cadastrado com sucesso!', [{ text: 'Cadastrar novo produto' }, { text: 'Voltar para a home' }]);
      };
      setButtonIsLoading(false);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Cadastro de Produto', 'Não foi possível cadastrar o produto. Por favor, verifique os campos e tente novamente.');
      //throw new Error(error);
      setButtonIsLoading(false);
    };
  };

  async function fetchProduct() {
    setLoading(true);
    try {
      const { data } = await api.get('product', {
        params: {
          product_id: id
        }
      });
      if (!data) {
      } else {
        setProduct(data);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <Header type='primary' title='Cadastrar produto' />

        <Upload>
          <ProductImage uri={productImage} />

          <PickImageButton
            title='Carregar'
            type='secondary'
            onPress={handlePickerImage}
          />
        </Upload>

        <Form>
          <InputGroup>
            <InputCategory
              label='Categoria'
              name='category'
              control={control}
              error={errors.category && errors.category.message}
            />
          </InputGroup>

          <InputGroup>
            <InputForm
              label='Nome'
              autoCapitalize='words'
              autoCorrect={false}
              name='name'
              control={control}
              error={errors.name && errors.name.message}
            />
          </InputGroup>

          <InputGroup>
            <InputGroupHeader>
              <Label>Descrição</Label>
              <MaxCharacters>0 de 60 caracteres</MaxCharacters>
            </InputGroupHeader>
            <InputForm
              autoCapitalize='sentences'
              autoCorrect={true}
              multiline
              maxLength={60}
              name='description'
              control={control}
              error={errors.description && errors.description.message}
              style={{ height: 80 }}
            />
          </InputGroup>

          <InputGroup>
            <Label>Tamanhos e valores</Label>
            <InputPrice
              size='P'
              name='priceSizeP'
              control={control}
              error={errors.priceSizeP && errors.priceSizeP.message}
            />
            <InputPrice
              size='M'
              name='priceSizeM'
              control={control}
              error={errors.priceSizeM && errors.priceSizeM.message}
            />
            <InputPrice
              size='G'
              name='priceSizeG'
              control={control}
              error={errors.priceSizeG && errors.priceSizeG.message}
            />
            <InputPrice
              size='GG'
              name='priceSizeGG'
              control={control}
              error={errors.priceSizeGG && errors.priceSizeGG.message}
            />
          </InputGroup>

          <Button
            title='Cadastrar produto'
            isLoading={buttonIsLoading}
            onPress={handleSubmit(handleAddProduct)}
          />
        </Form>
      </ScrollView>
    </Container>
  );
}